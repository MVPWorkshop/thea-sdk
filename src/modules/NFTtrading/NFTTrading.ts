import { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";
import { hexDataLength, hexDataSlice } from "@ethersproject/bytes";
import { padEnd, padStart, ContractWrapper, signerRequired, TheaError, typedDataSignerRequired } from "src/utils";
import { v4 } from "uuid";
import {
	ECSignature,
	ERC1155OrderStruct,
	ERC1155OrderStructSerialized,
	IZeroExContract,
	OrderSide,
	OrderStructOptionsCommon,
	OrderStructOptionsCommonStrict,
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
	NULL_ADDRESS,
	ONE_TWENTY_EIGHT_BIT_LENGTH,
	PROPERTY_ABI,
	RESERVED_APP_ID_PREFIX,
	STABLE_TOKEN_DECIMALS_MULTIPLIER
} from "src/utils/consts";
import { approve, checkBalance } from "../shared";
import { Orderbook } from "./orderbook";
import { BigNumber } from "@ethersproject/bignumber";
import OxExchange_ABI from "../../abi/0xExchange_ABI.json";

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
	// cancel order on Exchange contract, with order id, which is actually order nonce
	async cancelOrder(orderId: string) {
		signerRequired(this.signer);
		const cancelOrderResponse = await this.contract.cancelERC1155Order(orderId);
		return cancelOrderResponse.wait();
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
	async enterNFTLimit(
		tokenId: string,
		side: OrderSide,
		price: number,
		quantity: number,
		userConfig?: Partial<OrderStructOptionsCommonStrict>
	) {
		typedDataSignerRequired(this.signer);
		if (side === "sell") {
			await checkBalance(this.signer as Signer, this.network, { token: "ERC1155", tokenId, amount: quantity });

			await approve(this.signer as Signer, this.network, {
				token: "ERC1155",
				spender: consts[`${this.network}`].exchangeProxyAddress
			});
		} else {
			const stableTokenAmount = (price * quantity * STABLE_TOKEN_DECIMALS_MULTIPLIER).toString();
			await checkBalance(this.signer as Signer, this.network, {
				token: "ERC20",
				amount: stableTokenAmount,
				tokenName: "Stable"
			});

			await approve(this.signer as Signer, this.network, {
				token: "ERC20",
				amount: stableTokenAmount,
				spender: consts[`${this.network}`].exchangeProxyAddress,
				tokenName: "Stable"
			});
		}
		const signer = this.signer as Signer;
		const makerAddress = await signer.getAddress();
		const builtOrder = this.buildOrder(tokenId, side, price, quantity, makerAddress, userConfig);
		const signedOrder = await this.signOrder(builtOrder);
		const orderBookResponse = await this.orderBook.postOrder(signedOrder);
		return orderBookResponse;
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
	 *   First 128bits:  ${SDK_PREFIX}${APP_ID}000000 (right padded zeroes to fill)
	 *   Second 128bits: ${RANDOM_GENERATED_128BIT_ORDER_HASH}
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
