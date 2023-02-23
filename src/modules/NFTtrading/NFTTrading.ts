import { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";
import { hexDataLength, hexDataSlice } from "@ethersproject/bytes";
import { padEnd, padStart, ContractWrapper, signerRequired, TheaError, typedDataSignerRequired } from "src/utils";
import { v4 } from "uuid";
import {
	ECSignature,
	ERC1155OrderStruct,
	ERC1155OrderStructSerialized,
	IZeroExContract,
	MarketFillableOrder,
	MarketOrder,
	OrderSide,
	OrderStructOptionsCommon,
	OrderStructOptionsCommonStrict,
	PriceListings,
	ProviderOrSigner,
	SignedERC1155OrderStruct,
	TheaNetwork,
	TradeDirection,
	UserFacingERC1155AssetDataSerializedV4,
	UserFacingERC20AssetDataSerializedV4
} from "src/types";
import {
	consts,
	DEFAULT_APP_ID,
	ERC1155ORDER_STRUCT_ABI,
	ERC1155ORDER_STRUCT_NAME,
	FEE_ABI,
	INFINITE_EXPIRATION_TIMESTAMP_SEC,
	MAX_APPROVAL,
	NULL_ADDRESS,
	ONE_TWENTY_EIGHT_BIT_LENGTH,
	PROPERTY_ABI,
	RESERVED_APP_ID_PREFIX,
	STABLE_TOKEN_DECIMALS_MULTIPLIER
} from "src/utils/consts";
import { approve, checkBalance, execute } from "../shared";
import { Orderbook } from "./orderbook";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import OxExchange_ABI from "../../abi/0xExchange_ABI.json";
import { ContractReceipt } from "@ethersproject/contracts";

export class NFTTrading extends ContractWrapper<IZeroExContract> {
	readonly orderBook: Orderbook;
	readonly network: TheaNetwork;
	readonly signer: ProviderOrSigner;

	constructor(signer: ProviderOrSigner, network: TheaNetwork, orderbook: Orderbook) {
		super(signer, OxExchange_ABI, consts[`${network}`].exchangeProxyAddress);
		this.network = network;
		this.orderBook = orderbook;
		this.signer = signer;
	}

	async enterNFTLimit(
		tokenId: string,
		side: OrderSide,
		price: number,
		quantity: number,
		chunks = 1,
		userConfig?: Partial<OrderStructOptionsCommonStrict>
	) {
		typedDataSignerRequired(this.signer);
		if (quantity % chunks !== 0) {
			throw new TheaError({ type: "INVALID_CHUNK_SIZE", message: "Quantity must be divisible by chunks" });
		}
		if (side === "sell") {
			await checkBalance(this.signer as Signer, this.network, { token: "ERC1155", tokenId, amount: quantity });

			await approve(this.signer as Signer, this.network, {
				token: "ERC1155",
				spender: consts[`${this.network}`].exchangeProxyAddress
			});
		} else {
			const stableTokenAmount = BigNumber.from(price)
				.mul(quantity)
				.mul(STABLE_TOKEN_DECIMALS_MULTIPLIER.toString())
				.toString();
			await checkBalance(this.signer as Signer, this.network, {
				token: "ERC20",
				amount: stableTokenAmount,
				tokenName: "Stable"
			});

			await approve(this.signer as Signer, this.network, {
				token: "ERC20",
				amount: MAX_APPROVAL.toString(),
				spender: consts[`${this.network}`].exchangeProxyAddress,
				tokenName: "Stable"
			});
		}
		const signer = this.signer as Signer;
		const makerAddress = await signer.getAddress();
		const orderBookResponses = [];
		for (let i = 0; i < chunks; i++) {
			const builtOrder = this.buildOrder(tokenId, side, price, quantity / chunks, makerAddress, userConfig);
			const signedOrder = await this.signOrder(builtOrder);
			const orderBookResponse = this.orderBook.postOrder(signedOrder);
			orderBookResponses.push(orderBookResponse);
		}
		return Promise.all(orderBookResponses);
	}
	// cancel order on Exchange contract, with order id, which is actually order nonce
	async cancelOrder(orderId: string) {
		signerRequired(this.signer);
		return execute(this.contract.cancelERC1155Order(orderId), {
			...this.contractDetails,
			contractFunction: "cancelERC1155Order"
		});
	}
	async updateOrder(orderId: string, price: number, quantity: number) {
		typedDataSignerRequired(this.signer);
		await this.cancelOrder(orderId);
		const canceledOrder = await this.orderBook.queryOrderByNonce(orderId);
		const updatedOrder = await this.enterNFTLimit(
			canceledOrder.nftTokenId,
			canceledOrder.sellOrBuyNft,
			price,
			quantity
		);
		return updatedOrder;
	}
	// try to fill oreder on Exchange contract,for sprecified tokenId and quantity
	// available orders are queried from Orderbook, and matched based on lowest price first until quantity is filled
	async enterNFTOrderAtMarket(tokenId: string, side: OrderSide, quantity: number) {
		signerRequired(this.signer);
		const priceListingSide = side === "buy" ? "sell" : "buy";
		const priceListing: PriceListings[] = await this.orderBook.queryPriceListing(tokenId, priceListingSide);
		if (priceListing.length === 0) {
			throw new TheaError({
				message: "No price listing found for this tokenId and side",
				type: "NO_PRICE_LISTING_FOUND"
			});
		}
		if (priceListingSide === "sell") {
			const marketOrder = this.parseSellOrdersAndAmountsToBeFilled(priceListing, quantity);
			await checkBalance(this.signer as Signer, this.network, {
				token: "ERC20",
				amount: marketOrder.amount,
				tokenName: "Stable"
			});
			await approve(this.signer as Signer, this.network, {
				token: "ERC20",
				amount: marketOrder.amount,
				spender: consts[`${this.network}`].exchangeProxyAddress,
				tokenName: "Stable"
			});
			const erc1155SignedOrders: SignedERC1155OrderStruct[] = marketOrder.ordersToBeFilled.map((orderObj) => {
				return orderObj.order as SignedERC1155OrderStruct;
			}) as SignedERC1155OrderStruct[];
			const erc1155SignedOrdersAmount: BigNumberish[] = marketOrder.ordersToBeFilled.map((orderObj) => {
				return orderObj.amount as BigNumberish;
			}) as BigNumberish[];
			return execute(
				this.contract.batchBuyERC1155s(
					erc1155SignedOrders,
					erc1155SignedOrders.map((so) => so.signature),
					erc1155SignedOrdersAmount,
					erc1155SignedOrders.map(() => "0x"),
					true
				),
				{
					...this.contractDetails,
					contractFunction: "batchBuyERC1155s"
				}
			);
		} else {
			await checkBalance(this.signer as Signer, this.network, { token: "ERC1155", tokenId, amount: quantity });
			const marketOrder = this.parseBuyOrdersAndAmountsToBeFilled(priceListing, quantity);
			await approve(this.signer as Signer, this.network, {
				token: "ERC1155",
				spender: consts[`${this.network}`].exchangeProxyAddress
			});
			const nonce = await (this.signer as Signer).getTransactionCount();
			const sellOrders: Promise<ContractReceipt>[] = [];
			for (let i = 0; i < marketOrder.ordersToBeFilled.length; i++) {
				const orderObj = marketOrder.ordersToBeFilled[`${i}`];
				const executeOrder = execute(
					this.contract.sellERC1155(orderObj.order, orderObj.order.signature, tokenId, orderObj.amount, false, "0x", {
						nonce: nonce + i
					}),
					{
						...this.contractDetails,
						contractFunction: "sellERC1155",
						contractArgs: ["nonce: " + orderObj.order.nonce]
					}
				);
				sellOrders.push(executeOrder);
			}
			return Promise.all(sellOrders);
		}
	}
	// quantity param represents the amount of NFTs to be bought, and return value is the amount of stable tokens to be spend and the orders to be filled
	parseSellOrdersAndAmountsToBeFilled(priceListing: PriceListings[], quantity: number): MarketOrder {
		const ordersToBeFilled: MarketFillableOrder[] = [];
		let cummulativeQuantity = 0;
		let stableTokenAmount = BigNumber.from(0);
		for (let i = 0; i < priceListing.length; i++) {
			const listing = priceListing[`${i}`];
			cummulativeQuantity += parseInt(listing.nftTokenAmount);
			if (cummulativeQuantity > quantity) {
				const partialAmount = quantity - (cummulativeQuantity - parseInt(listing.nftTokenAmount));
				stableTokenAmount = BigNumber.from(listing.orderToBeFilled.erc20TokenAmount)
					.mul(partialAmount)
					.div(listing.nftTokenAmount)
					.add(stableTokenAmount);
				ordersToBeFilled.push({
					order: listing.orderToBeFilled,
					amount: quantity - (cummulativeQuantity - parseInt(listing.nftTokenAmount))
				});
				break;
			} else if (cummulativeQuantity === quantity) {
				stableTokenAmount = BigNumber.from(listing.orderToBeFilled.erc20TokenAmount).add(stableTokenAmount);
				ordersToBeFilled.push({
					order: listing.orderToBeFilled,
					amount: parseInt(listing.nftTokenAmount)
				});
				break;
			} else {
				stableTokenAmount = BigNumber.from(listing.orderToBeFilled.erc20TokenAmount).add(stableTokenAmount);
				ordersToBeFilled.push({
					order: listing.orderToBeFilled,
					amount: parseInt(listing.nftTokenAmount)
				});
			}
		}
		if (cummulativeQuantity < quantity) {
			throw new TheaError({
				message: "Not enough liquidity in market to sell tokens",
				type: "NO_PRICE_LISTING_FOUND"
			});
		}
		return { ordersToBeFilled, amount: stableTokenAmount.toString() };
	}
	// quantity param represents the amount of NFTs to be sold, and return value is the amount of NFTs to be sold and the orders to be filled
	parseBuyOrdersAndAmountsToBeFilled(priceListing: PriceListings[], quantity: number): MarketOrder {
		const ordersToBeFilled: MarketFillableOrder[] = [];
		let cummulativeQuantity = 0;
		for (let i = 0; i < priceListing.length; i++) {
			const listing = priceListing[`${i}`];
			cummulativeQuantity += parseInt(listing.nftTokenAmount);
			if (cummulativeQuantity >= quantity) {
				const partialAmount = quantity - (cummulativeQuantity - parseInt(listing.nftTokenAmount));
				ordersToBeFilled.push({
					order: listing.orderToBeFilled,
					amount: partialAmount
				});
				break;
			} else {
				ordersToBeFilled.push({
					order: listing.orderToBeFilled,
					amount: parseInt(listing.nftTokenAmount)
				});
			}
		}
		if (cummulativeQuantity < quantity) {
			throw new TheaError({
				message: "Not enough liquidity in market to buy tokens",
				type: "NO_PRICE_LISTING_FOUND"
			});
		}
		return { ordersToBeFilled, amount: quantity.toString() };
	}
	// fill any order that is signed by the owner of the NFT. This orders can be retreived from orderbook query PriceListing method (orderToBeFilled)
	async fillOrder(order: SignedERC1155OrderStruct, amount: BigNumberish) {
		signerRequired(this.signer);
		if (order.erc1155TokenAmount < amount) {
			throw new TheaError({
				message: "Amount to be filled is greater than the token amount in the order",
				type: "INVALID_AMOUNT"
			});
		}
		if (order.direction === TradeDirection.SellNFT) {
			const stableTokenAmount = BigNumber.from(order.erc20TokenAmount).mul(amount).div(order.erc1155TokenAmount);
			await checkBalance(this.signer as Signer, this.network, {
				token: "ERC20",
				amount: stableTokenAmount.toString(),
				tokenName: "Stable"
			});

			await approve(this.signer as Signer, this.network, {
				token: "ERC20",
				amount: stableTokenAmount.toString(),
				spender: consts[`${this.network}`].exchangeProxyAddress,
				tokenName: "Stable"
			});
			return execute(this.contract.buyERC1155(order, order.signature, amount, "0x"), {
				...this.contractDetails,
				contractFunction: "buyERC1155"
			});
		} else {
			await checkBalance(this.signer as Signer, this.network, {
				token: "ERC1155",
				tokenId: order.erc1155TokenId,
				amount: amount
			});
			await approve(this.signer as Signer, this.network, {
				token: "ERC1155",
				spender: consts[`${this.network}`].exchangeProxyAddress
			});
			return execute(this.contract.sellERC1155(order, order.signature, order.erc1155TokenId, amount, false, "0x"), {
				...this.contractDetails,
				contractFunction: "sellERC1155"
			});
		}
	}
	/**
	 * Signs a 0x order. Requires a signer (e.g. wallet or private key)
	 * Once signed, the order becomes fillable (as long as the order is valid)
	 * 0x orders require a signature to fill.
	 * @param order A 0x v4 order
	 * @returns A signed 0x v4 order
	 */
	async signOrder(order: ERC1155OrderStruct): Promise<SignedERC1155OrderStruct> {
		const rawSignature = await this.signOrderWithEoaWallet(
			order,
			this.signer as TypedDataSigner,
			this.network,
			consts[`${this.network}`].exchangeProxyAddress
		);

		const ecSignature = this.parseRawSignature(rawSignature);

		const signedOrder = {
			...order,
			signature: {
				signatureType: 2,
				r: ecSignature.r,
				s: ecSignature.s,
				v: ecSignature.v
			}
		};
		return signedOrder;
	}

	// Parse a hex signature returned by an RPC call into an `ECSignature`.
	parseRawSignature(rawSignature: string): ECSignature {
		const hexSize = hexDataLength(rawSignature);
		if (hexSize !== 65) {
			throw new TheaError({
				message: "Invalid signature length, expected 65",
				type: "INVALID_SIGNATURE_SIZE"
			});
		}
		// Some providers encode V as 0,1 instead of 27,28.
		const VALID_V_VALUES = [0, 1, 27, 28];
		// Some providers return the signature packed as V,R,S and others R,S,V.
		let v = parseInt(rawSignature.slice(-2), 16);
		if (VALID_V_VALUES.includes(v)) {
			// Format is R,S,V
			v = v >= 27 ? v : v + 27;
			return {
				r: hexDataSlice(rawSignature, 0, 32),
				s: hexDataSlice(rawSignature, 32, 64),
				v
			};
		}
		// Format should be V,R,S
		v = parseInt(rawSignature.slice(2, 4), 16);
		if (!VALID_V_VALUES.includes(v)) {
			throw new TheaError({
				message: "Cannot determine RPC signature layout from V value",
				type: "INVALID_SIGNATURE_LAYOUT"
			});
		}
		v = v >= 27 ? v : v + 27;

		return {
			v,
			r: hexDataSlice(rawSignature, 1, 33),
			s: hexDataSlice(rawSignature, 33, 65)
		};
	}

	async signOrderWithEoaWallet(
		order: ERC1155OrderStruct,
		signer: TypedDataSigner,
		chainId: number,
		exchangeContractAddress: string
	) {
		const domain = {
			chainId: chainId,
			verifyingContract: exchangeContractAddress,
			name: "ZeroEx",
			version: "1.0.0"
		};
		const types = {
			[ERC1155ORDER_STRUCT_NAME]: ERC1155ORDER_STRUCT_ABI,
			Fee: FEE_ABI,
			Property: PROPERTY_ABI
		};
		const value = order;

		const rawSignatureFromEoaWallet = await signer._signTypedData(domain, types, value);

		return rawSignatureFromEoaWallet;
	}

	/**
	 * Builds a 0x order given two assets (either NFT<>ERC20 or ERC20<>NFT)
	 * @param makerAsset An asset (ERC20, ERC721, or ERC1155) the user has
	 * @param takerAsset An asset (ERC20, ERC721, or ERC1155) the user wants
	 * @param makerAddress The address of the wallet creating the order
	 * @param orderConfig Various order configuration options (e.g. expiration, nonce)
	 */
	buildOrder(
		tokenId: string,
		side: OrderSide,
		price: number,
		quantity: number,
		makerAddress: string,
		userConfig?: Partial<OrderStructOptionsCommonStrict>
	): ERC1155OrderStructSerialized {
		const nft: UserFacingERC1155AssetDataSerializedV4 = {
			tokenAddress: consts[`${this.network}`].theaERC1155Contract,
			tokenId: tokenId,
			type: "ERC1155",
			amount: quantity.toString()
		};
		const erc20: UserFacingERC20AssetDataSerializedV4 = {
			tokenAddress: consts[`${this.network}`].stableTokenContract,
			type: "ERC20",
			amount: Math.floor(quantity * price * STABLE_TOKEN_DECIMALS_MULTIPLIER).toString()
		};
		const defaultConfig = {
			chainId: this.network,
			makerAddress: makerAddress,
			appId: userConfig?.appId ?? DEFAULT_APP_ID
		};
		const config = { ...defaultConfig, ...userConfig };

		const direction = side === "sell" ? TradeDirection.SellNFT : TradeDirection.BuyNFT;
		const erc1155Order = this.generateErc1155Order(nft, erc20, {
			direction,
			maker: makerAddress,
			...config
		});
		return erc1155Order;
	}
	generateErc1155Order(
		nft: UserFacingERC1155AssetDataSerializedV4,
		erc20: UserFacingERC20AssetDataSerializedV4,
		orderData: Partial<OrderStructOptionsCommon> & OrderStructOptionsCommonStrict
	): ERC1155OrderStructSerialized {
		const expiry = INFINITE_EXPIRATION_TIMESTAMP_SEC.toString();
		const erc1155Order: ERC1155OrderStructSerialized = {
			erc1155Token: nft.tokenAddress.toLowerCase(),
			erc1155TokenId: nft.tokenId,
			erc1155TokenAmount: nft.amount,
			direction: parseInt(orderData.direction.toString(10)),
			erc20Token: erc20.tokenAddress.toLowerCase(),
			erc20TokenAmount: erc20.amount,
			maker: orderData.maker.toLowerCase(),
			erc1155TokenProperties: [],
			fees: [],
			expiry: expiry,
			nonce: this.generateRandomV4OrderNonce(orderData.appId),
			taker: NULL_ADDRESS
		};

		return erc1155Order;
	}

	/**
	 * Generates a 256bit nonce.
	 * The format:
	 * @example First 128bits:  ${SDK_PREFIX}${APP_ID}000000 (right padded zeroes to fill)
	 * @example Second 128bits: ${RANDOM_GENERATED_128BIT_ORDER_HASH}
	 * @returns 128bit nonce as string (0x orders can handle up to 256 bit nonce)
	 */
	generateRandomV4OrderNonce(appId: string = DEFAULT_APP_ID): string {
		if (!(appId.length < ONE_TWENTY_EIGHT_BIT_LENGTH && this.checkIfStringContainsOnlyNumbers(appId))) {
			throw new TheaError({ message: "Invalid appId", type: "INVALID_APP_ID" });
		}
		const order128 = padStart(this.generateRandom128BitNumber(), ONE_TWENTY_EIGHT_BIT_LENGTH, "0");
		const appId128 = padEnd(`${RESERVED_APP_ID_PREFIX}${appId}`, ONE_TWENTY_EIGHT_BIT_LENGTH, "0");
		const final256BitNonce = `${appId128}${order128}`;
		return final256BitNonce;
	}

	checkIfStringContainsOnlyNumbers(val: string) {
		const onlyNumbers = /^\d+$/.test(val);
		return onlyNumbers;
	}

	// uuids are 128bits
	generateRandom128BitNumber(): string {
		const hex = "0x" + v4().replace(/-/g, "");
		const value = BigNumber.from(hex);
		const valueBase10String = value.toString(); // don't convert this to a number, will lose precision
		return valueBase10String;
	}
}
