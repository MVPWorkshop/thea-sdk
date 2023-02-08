import { Signer } from "@ethersproject/abstract-signer";
import { ContractTransaction } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
	TheaError,
	TheaNetwork,
	consts,
	NFTTrading,
	IZeroExContract,
	Orderbook,
	PostOrderResponsePayload,
	STABLE_TOKEN_DECIMALS_MULTIPLIER,
	MAX_APPROVAL
} from "../../../src";
import * as shared from "../../../src/modules/shared";
import * as uuid from "uuid";
import * as utils from "../../../src/utils/utils";
import { postOrderResponseMock, priceListingReturnMockBuy, priceListingReturnMockSell, PRIVATE_KEY } from "../../mocks";
import ZeroExExchange_ABI from "../../../src/abi/0xExchange_ABI.json";

const exchangeProxyContractAddress = consts[TheaNetwork.GANACHE].exchangeProxyAddress;

jest.mock("../../../src/modules/shared", () => {
	return {
		checkBalance: jest.fn(),
		approve: jest.fn(),
		execute: jest.fn().mockImplementation(() => {
			return {
				to: exchangeProxyContractAddress,
				from: "0x123",
				contractAddress: exchangeProxyContractAddress
			};
		})
	};
});

jest.mock("uuid", () => {
	return {
		v4: jest.fn()
	};
});
describe("NFTTrading", () => {
	const providerOrSigner = new Wallet(PRIVATE_KEY);
	let nftTrading: NFTTrading;
	const orderId = "1";
	const tokenId = "1";
	const network = TheaNetwork.GANACHE;
	const contractAddress = exchangeProxyContractAddress;

	const contractTransaction: Partial<ContractTransaction> = {
		wait: jest.fn().mockResolvedValue({
			to: exchangeProxyContractAddress,
			from: "0x123",
			contractAddress: exchangeProxyContractAddress
		})
	};
	const txPromise = Promise.resolve(contractTransaction as ContractTransaction);

	const mockContract: Partial<IZeroExContract> = {
		cancelERC1155Order: jest.fn().mockReturnValue(txPromise),
		buyERC1155: jest.fn().mockReturnValue(txPromise),
		batchBuyERC1155s: jest.fn().mockReturnValue(txPromise),
		sellERC1155: jest.fn().mockReturnValue(txPromise)
	};
	const queryOrderByNonceTransaction = {
		erc20Token: "0xd393b1e02da9831ff419e22ea105aae4c47e1253",
		erc20TokenAmount: "11000000000000000000",
		nftToken: "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
		nftTokenId: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
		nftTokenAmount: "1",
		nftType: "ERC1155",
		sellOrBuyNft: "sell",
		chainId: "80001",
		order: {
			direction: 0,
			erc20Token: "0xd393b1e02da9831ff419e22ea105aae4c47e1253",
			erc20TokenAmount: "11000000000000000000",
			erc1155Token: "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
			erc1155TokenId: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
			erc1155TokenAmount: "1",
			erc1155TokenProperties: [],
			expiry: "2524604400",
			fees: [],
			maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
			nonce: "100133271337000000000000000000000000000231490221163970875062646502458790748015",
			signature: {
				signatureType: 2,
				r: "0x396f2d0a0328e9d96e41fe9c58b61d8d19c1051569796135a1d44ab55aa5d57c",
				s: "0x220f98a893146109b2a2a9b4832c9cdf39d9b5e353a274e1829360840080638c",
				v: 27
			},
			taker: "0x0000000000000000000000000000000000000000"
		},
		orderStatus: {
			status: null,
			transactionHash: null,
			blockNumber: null
		},
		metadata: {}
	};

	const buildOrderReturnValue = {
		direction: 0,
		erc20Token: "0xd393b1e02da9831ff419e22ea105aae4c47e1253",
		erc20TokenAmount: "11000000000000000000",
		erc1155Token: "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
		erc1155TokenId: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
		erc1155TokenAmount: "1",
		erc1155TokenProperties: [],
		expiry: "2524604400",
		fees: [],
		maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
		nonce: "100133271337000000000000000000000000000231490221163970875062646502458790748015",
		taker: "0x0000000000000000000000000000000000000000"
	};

	const signOrderReturnValue = {
		direction: 0,
		erc20Token: "0xd393b1e02da9831ff419e22ea105aae4c47e1253",
		erc20TokenAmount: "11000000000000000000",
		erc1155Token: "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
		erc1155TokenId: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
		erc1155TokenAmount: "1",
		erc1155TokenProperties: [],
		expiry: "2524604400",
		fees: [],
		signature: {
			signatureType: 2,
			r: "0x396f2d0a0328e9d96e41fe9c58b61d8d19c1051569796135a1d44ab55aa5d57c",
			s: "0x220f98a893146109b2a2a9b4832c9cdf39d9b5e353a274e1829360840080638c",
			v: 27
		},
		maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
		nonce: "100133271337000000000000000000000000000231490221163970875062646502458790748015",
		taker: "0x0000000000000000000000000000000000000000"
	};

	beforeEach(() => {
		const orderBook = new Orderbook(network);
		nftTrading = new NFTTrading(providerOrSigner, network, orderBook);
		nftTrading.contract = mockContract as IZeroExContract;
	});

	describe("cancelOrder", () => {
		it("should throw error that signer is required", async () => {
			const orderBook = new Orderbook(network);
			nftTrading = new NFTTrading(new JsonRpcProvider(), network, orderBook);
			await expect(nftTrading.cancelOrder(orderId)).rejects.toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});

		it("should call cancelERC1155Order method from contract", async () => {
			const executeSpy = jest.spyOn(shared, "execute");
			const result = await nftTrading.cancelOrder(orderId);
			expect(executeSpy).toHaveBeenCalledWith(txPromise, {
				name: ZeroExExchange_ABI.contractName,
				address: contractAddress,
				contractFunction: "cancelERC1155Order"
			});
			expect(result).toMatchObject({
				to: exchangeProxyContractAddress,
				from: "0x123",
				contractAddress: exchangeProxyContractAddress
			});
		});
	});

	describe("updateOrder", () => {
		it("should throw error that typed data signer is required", async () => {
			const orderBook = new Orderbook(network);
			nftTrading = new NFTTrading(new JsonRpcProvider(), network, orderBook);
			await expect(nftTrading.updateOrder(orderId, 10, 1)).rejects.toThrow(
				new TheaError({
					type: "TYPED_DATA_SIGNER_REQUIRED",
					message:
						"TypedDataSigner is required for this operation. You must pass in a TypedDataSigner(Wallet) on SDK initialization"
				})
			);
		});

		it("should update order which includes canceling previous order and posting new one to orderbook", async () => {
			const price = 10;
			const quantity = 1;
			const executeSpy = jest.spyOn(shared, "execute");
			const enterNftLimitTxPromise = Promise.resolve([postOrderResponseMock] as PostOrderResponsePayload[]);
			const enterNftLimitSpy = jest.spyOn(nftTrading, "enterNFTLimit").mockReturnValue(enterNftLimitTxPromise);
			const queryOrderByNonceSpy = jest
				.spyOn(nftTrading.orderBook, "queryOrderByNonce")
				.mockResolvedValue(queryOrderByNonceTransaction as PostOrderResponsePayload);
			const result = await nftTrading.updateOrder(orderId, price, quantity);
			expect(executeSpy).toHaveBeenCalledWith(txPromise, {
				name: ZeroExExchange_ABI.contractName,
				address: contractAddress,
				contractFunction: "cancelERC1155Order"
			});
			expect(queryOrderByNonceSpy).toHaveBeenCalled();
			expect(enterNftLimitSpy).toHaveBeenCalled();
			expect(result).toMatchObject([postOrderResponseMock]);
		});
	});

	describe("enterNFTLimit", () => {
		it("should throw error that typed data signer is required", async () => {
			const orderBook = new Orderbook(network);
			nftTrading = new NFTTrading(new JsonRpcProvider(), network, orderBook);
			await expect(nftTrading.enterNFTLimit(tokenId, "sell", 10, 1)).rejects.toThrow(
				new TheaError({
					type: "TYPED_DATA_SIGNER_REQUIRED",
					message:
						"TypedDataSigner is required for this operation. You must pass in a TypedDataSigner(Wallet) on SDK initialization"
				})
			);
		});

		it("should throw error that quantity isn't breakable on desired chunks", async () => {
			await expect(nftTrading.enterNFTLimit(tokenId, "sell", 10, 3, 2)).rejects.toThrow(
				new TheaError({
					type: "INVALID_CHUNK_SIZE",
					message: "Quantity must be divisible by chunks"
				})
			);
		});

		it("should call create sell order and post order to orderbook", async () => {
			const price = 10;
			const quantity = 1;
			const signer = "0xca1edbea332fe36a4164bfc85bc58de12f07f941";
			const getAddressPromise = Promise.resolve(signer as string);
			const getAddressSpy = jest.spyOn(nftTrading.signer as Signer, "getAddress").mockReturnValue(getAddressPromise);
			const buildOrderSpy = jest.spyOn(nftTrading, "buildOrder").mockReturnValue(buildOrderReturnValue);
			const signOrderPromise = Promise.resolve(signOrderReturnValue);
			const signOrderSpy = jest.spyOn(nftTrading, "signOrder").mockReturnValue(signOrderPromise);
			const postOrderTxPromise = Promise.resolve(postOrderResponseMock as PostOrderResponsePayload);
			const postOrderSpy = jest.spyOn(nftTrading.orderBook, "postOrder").mockReturnValue(postOrderTxPromise);
			const checkBalanceSpy = jest.spyOn(shared, "checkBalance").mockReturnThis();
			const approveSpy = jest.spyOn(shared, "approve");
			const result = await nftTrading.enterNFTLimit(orderId, "sell", price, quantity);
			expect(getAddressSpy).toHaveBeenCalled();
			expect(postOrderSpy).toHaveBeenCalled();
			expect(checkBalanceSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC1155",
				tokenId,
				amount: quantity
			});
			expect(approveSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC1155",
				spender: exchangeProxyContractAddress
			});
			expect(buildOrderSpy).toHaveBeenCalled();
			expect(signOrderSpy).toHaveBeenCalled();
			expect(result).toMatchObject([postOrderResponseMock]);
		});

		it("should call create buy order and post order to orderbook", async () => {
			const price = 10;
			const quantity = 1;
			const signer = "0xca1edbea332fe36a4164bfc85bc58de12f07f941";
			const stableTokenAmount = (price * quantity * STABLE_TOKEN_DECIMALS_MULTIPLIER).toString();
			const getAddressPromise = Promise.resolve(signer as string);
			const getAddressSpy = jest.spyOn(nftTrading.signer as Signer, "getAddress").mockReturnValue(getAddressPromise);
			const buildOrderSpy = jest.spyOn(nftTrading, "buildOrder").mockReturnValue(buildOrderReturnValue);
			const signOrderPromise = Promise.resolve(signOrderReturnValue);
			const signOrderSpy = jest.spyOn(nftTrading, "signOrder").mockReturnValue(signOrderPromise);
			const postOrderTxPromise = Promise.resolve(postOrderResponseMock as PostOrderResponsePayload);
			const postOrderSpy = jest.spyOn(nftTrading.orderBook, "postOrder").mockReturnValue(postOrderTxPromise);
			const checkBalanceSpy = jest.spyOn(shared, "checkBalance");
			const approveSpy = jest.spyOn(shared, "approve");
			const result = await nftTrading.enterNFTLimit(tokenId, "buy", price, quantity);
			expect(getAddressSpy).toHaveBeenCalled();
			expect(postOrderSpy).toHaveBeenCalled();
			expect(buildOrderSpy).toHaveBeenCalled();
			expect(signOrderSpy).toHaveBeenCalled();
			expect(checkBalanceSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC20",
				amount: stableTokenAmount,
				tokenName: "Stable"
			});
			expect(approveSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC20",
				amount: MAX_APPROVAL.toString(),
				tokenName: "Stable",
				spender: exchangeProxyContractAddress
			});
			expect(result).toMatchObject([postOrderResponseMock]);
		});
	});

	describe("fillOrder", () => {
		it("should throw error that data signer is required", async () => {
			const orderBook = new Orderbook(network);
			const sellOrder = priceListingReturnMockSell[0].orderToBeFilled;
			nftTrading = new NFTTrading(new JsonRpcProvider(), network, orderBook);
			await expect(nftTrading.fillOrder(sellOrder, sellOrder.erc1155TokenAmount)).rejects.toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});
		it("should throw error that wanted amount is larger than given order amount", async () => {
			const sellOrder = priceListingReturnMockSell[0].orderToBeFilled;
			await expect(nftTrading.fillOrder(sellOrder, parseInt(sellOrder.erc1155TokenAmount) + 1)).rejects.toThrow(
				new TheaError({
					type: "INVALID_AMOUNT",
					message: "Amount to be filled is greater than the token amount in the order"
				})
			);
		});

		it("should fill sell order if amount wanted is equal or less than what is in order", async () => {
			const sellOrder = priceListingReturnMockSell[0].orderToBeFilled;
			const checkBalanceSpy = jest.spyOn(shared, "checkBalance").mockReturnThis();
			const approveSpy = jest.spyOn(shared, "approve");
			const executeSpy = jest.spyOn(shared, "execute");
			await nftTrading.fillOrder(sellOrder, sellOrder.erc1155TokenAmount);
			expect(checkBalanceSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC20",
				amount: sellOrder.erc20TokenAmount,
				tokenName: "Stable"
			});
			expect(approveSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC20",
				amount: MAX_APPROVAL.toString(),
				tokenName: "Stable",
				spender: exchangeProxyContractAddress
			});
			expect(executeSpy).toHaveBeenCalledWith(txPromise, {
				name: ZeroExExchange_ABI.contractName,
				address: contractAddress,
				contractFunction: "buyERC1155"
			});
		});
		it("should fill buy order if amount wanted is equal or less than what is in order", async () => {
			const buyOrder = priceListingReturnMockBuy[0].orderToBeFilled;
			const checkBalanceSpy = jest.spyOn(shared, "checkBalance").mockReturnThis();
			const approveSpy = jest.spyOn(shared, "approve");
			const executeSpy = jest.spyOn(shared, "execute");
			await nftTrading.fillOrder(buyOrder, buyOrder.erc1155TokenAmount);
			expect(checkBalanceSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC1155",
				tokenId,
				amount: buyOrder.erc1155TokenAmount
			});
			expect(approveSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC1155",
				spender: contractAddress
			});
			expect(executeSpy).toHaveBeenCalledWith(txPromise, {
				name: ZeroExExchange_ABI.contractName,
				address: contractAddress,
				contractFunction: "sellERC1155"
			});
		});
	});

	describe("enterNFTOrderAtMarket", () => {
		it("should throw error that typed data signer is required", async () => {
			const orderBook = new Orderbook(network);
			nftTrading = new NFTTrading(new JsonRpcProvider(), network, orderBook);
			await expect(nftTrading.enterNFTOrderAtMarket(orderId, "sell", 1)).rejects.toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});
		it("should throw error that there is no price listings for tokenId and side", async () => {
			jest.spyOn(nftTrading.orderBook, "queryPriceListing").mockResolvedValue([]);
			await expect(nftTrading.enterNFTOrderAtMarket(tokenId, "sell", 1)).rejects.toThrow(
				new TheaError({
					type: "NO_PRICE_LISTING_FOUND",
					message: "No price listing found for this tokenId and side"
				})
			);
		});
		it("should throw error if there is not enough liquidity on orderbook to fill the buy order", async () => {
			const quantity = 30;
			jest.spyOn(nftTrading.orderBook, "queryPriceListing").mockResolvedValue(priceListingReturnMockSell);
			await expect(nftTrading.enterNFTOrderAtMarket(tokenId, "buy", quantity)).rejects.toThrow(
				new TheaError({
					type: "NO_PRICE_LISTING_FOUND",
					message: "Not enough liquidity in market to sell tokens"
				})
			);
		});
		it("should fullfill buy market order for exact amount as 1. order from price listing", async () => {
			const quantity = 10;
			const queryPriceListingSpy = jest
				.spyOn(nftTrading.orderBook, "queryPriceListing")
				.mockResolvedValue(priceListingReturnMockSell);
			const signerRequiredSpy = jest.spyOn(utils, "signerRequired");
			const executeSpy = jest.spyOn(shared, "execute");
			const checkBalance = jest.spyOn(shared, "checkBalance");
			const approveSpy = jest.spyOn(shared, "approve");
			const parseSellOrdersAndAmountsToBeFilledSpy = jest.spyOn(nftTrading, "parseSellOrdersAndAmountsToBeFilled");

			await nftTrading.enterNFTOrderAtMarket(tokenId, "buy", quantity);

			expect(queryPriceListingSpy).toHaveBeenCalledWith(tokenId, "sell");
			expect(signerRequiredSpy).toHaveBeenCalledWith(providerOrSigner);
			expect(parseSellOrdersAndAmountsToBeFilledSpy).toHaveBeenCalledWith(priceListingReturnMockSell, quantity);
			expect(checkBalance).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC20",
				amount: priceListingReturnMockSell[0].orderToBeFilled.erc20TokenAmount,
				tokenName: "Stable"
			});
			expect(approveSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC20",
				amount: priceListingReturnMockSell[0].orderToBeFilled.erc20TokenAmount,
				spender: contractAddress,
				tokenName: "Stable"
			});
			expect(executeSpy).toHaveBeenCalledWith(txPromise, {
				name: ZeroExExchange_ABI.contractName,
				address: contractAddress,
				contractFunction: "batchBuyERC1155s"
			});
		});
		it("should fullfill buy market order for amount less than 1. order from price listing", async () => {
			const quantity = 1;
			const queryPriceListingSpy = jest
				.spyOn(nftTrading.orderBook, "queryPriceListing")
				.mockResolvedValue(priceListingReturnMockSell);
			const signerRequiredSpy = jest.spyOn(utils, "signerRequired");
			const executeSpy = jest.spyOn(shared, "execute");
			const checkBalance = jest.spyOn(shared, "checkBalance");
			const approveSpy = jest.spyOn(shared, "approve");
			const parseSellOrdersAndAmountsToBeFilledSpy = jest.spyOn(nftTrading, "parseSellOrdersAndAmountsToBeFilled");

			await nftTrading.enterNFTOrderAtMarket(tokenId, "buy", quantity);

			expect(queryPriceListingSpy).toHaveBeenCalledWith(tokenId, "sell");
			expect(signerRequiredSpy).toHaveBeenCalledWith(providerOrSigner);
			expect(parseSellOrdersAndAmountsToBeFilledSpy).toHaveBeenCalledWith(priceListingReturnMockSell, quantity);
			expect(checkBalance).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC20",
				amount: (parseInt(priceListingReturnMockSell[0].orderToBeFilled.erc20TokenAmount) / 10).toString(),
				tokenName: "Stable"
			});
			expect(approveSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC20",
				amount: (parseInt(priceListingReturnMockSell[0].orderToBeFilled.erc20TokenAmount) / 10).toString(),
				spender: contractAddress,
				tokenName: "Stable"
			});
			expect(executeSpy).toHaveBeenCalledWith(txPromise, {
				name: ZeroExExchange_ABI.contractName,
				address: contractAddress,
				contractFunction: "batchBuyERC1155s"
			});
		});
		it("should throw error if there is not enough liquidity on orderbook to fill the sell order", async () => {
			const quantity = 30;
			jest.spyOn(nftTrading.orderBook, "queryPriceListing").mockResolvedValue(priceListingReturnMockBuy);
			await expect(nftTrading.enterNFTOrderAtMarket(tokenId, "sell", quantity)).rejects.toThrow(
				new TheaError({
					type: "NO_PRICE_LISTING_FOUND",
					message: "Not enough liquidity in market to buy tokens"
				})
			);
		});
		it("should fullfill sell market order for exact amount as 1. order from price listing", async () => {
			const quantity = 10;
			const queryPriceListingSpy = jest
				.spyOn(nftTrading.orderBook, "queryPriceListing")
				.mockResolvedValue(priceListingReturnMockBuy);
			const signerRequiredSpy = jest.spyOn(utils, "signerRequired");
			const executeSpy = jest.spyOn(shared, "execute");
			const checkBalance = jest.spyOn(shared, "checkBalance");
			const approveSpy = jest.spyOn(shared, "approve");
			const getTransactionSpy = jest.spyOn(nftTrading.signer, "getTransactionCount").mockResolvedValue(1);
			const parseBuyOrdersAndAmountsToBeFilledSpy = jest.spyOn(nftTrading, "parseBuyOrdersAndAmountsToBeFilled");
			await nftTrading.enterNFTOrderAtMarket(tokenId, "sell", quantity);
			expect(getTransactionSpy).toHaveBeenCalled();
			expect(queryPriceListingSpy).toHaveBeenCalledWith(tokenId, "buy");
			expect(signerRequiredSpy).toHaveBeenCalledWith(providerOrSigner);
			expect(parseBuyOrdersAndAmountsToBeFilledSpy).toHaveBeenCalledWith(priceListingReturnMockBuy, quantity);
			expect(checkBalance).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC1155",
				tokenId,
				amount: quantity
			});
			expect(approveSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC1155",
				spender: contractAddress
			});
			expect(executeSpy).toHaveBeenCalled();
		});
	});

	describe("signOrder", () => {
		it("should sign the order that has been passed", async () => {
			const result = await nftTrading.signOrder(buildOrderReturnValue);
			expect(result).toMatchObject({
				direction: 0,
				erc20Token: "0xd393b1e02da9831ff419e22ea105aae4c47e1253",
				erc20TokenAmount: "11000000000000000000",
				erc1155Token: "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
				erc1155TokenId: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
				erc1155TokenAmount: "1",
				erc1155TokenProperties: [],
				expiry: "2524604400",
				fees: [],
				maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
				nonce: "100133271337000000000000000000000000000231490221163970875062646502458790748015",
				taker: "0x0000000000000000000000000000000000000000",
				signature: {
					signatureType: 2,
					r: "0xd14c49db63b412d28efe3a4c39b282eaa3736e6c5cefb2c7e032feafb91dddf8",
					s: "0x6c5e3c6a14bde3d45bca94d0b7311d47162b2c62918b1b23f63c5eb34d9aa27f",
					v: 28
				}
			});
		});
	});

	describe("parseRawSignature", () => {
		it("should throw error signature length is invalid", async () => {
			const rawSignature =
				"0x8a97d5ade4a92a44f87d83fbe83b494090ecfdd3276720f4fb5b235614d07411dba9d8d9f3e774850e63a02e19da252e246ddeec9e879be9fafef0224644721c";
			expect(() => {
				nftTrading.parseRawSignature(rawSignature);
			}).toThrow(
				new TheaError({
					type: "INVALID_SIGNATURE_SIZE",
					message: "Invalid signature length, expected 65"
				})
			);
		});

		it("should throw error for invalid signature layout", async () => {
			const rawSignature =
				"0x9997d5ade4a92a44f87d83fbe83b494090ecfdd3276720f4fb5b235614d0770411dba9d8d9f3e774850e63a02e19da252e246ddeec9e879be9fafef02246447299";
			expect(() => {
				nftTrading.parseRawSignature(rawSignature);
			}).toThrow(
				new TheaError({
					type: "INVALID_SIGNATURE_LAYOUT",
					message: "Cannot determine RPC signature layout from V value"
				})
			);
		});

		it("should return raw signature if V value is in front of R and S", async () => {
			const rawSignature =
				"0x1c97d5ade4a92a44f87d83fbe83b494090ecfdd3276720f4fb5b235614d0770411dba9d8d9f3e774850e63a02e19da252e246ddeec9e879be9fafef02246447299";
			expect(nftTrading.parseRawSignature(rawSignature)).toEqual({
				v: 28,
				r: "0x97d5ade4a92a44f87d83fbe83b494090ecfdd3276720f4fb5b235614d0770411",
				s: "0xdba9d8d9f3e774850e63a02e19da252e246ddeec9e879be9fafef02246447299"
			});
		});

		it("should return raw signature if V value is in front of R and S", async () => {
			const rawSignature =
				"0x1c97d5ade4a92a44f87d83fbe83b494090ecfdd3276720f4fb5b235614d0770411dba9d8d9f3e774850e63a02e19da252e246ddeec9e879be9fafef02246447299";
			expect(nftTrading.parseRawSignature(rawSignature)).toEqual({
				v: 28,
				r: "0x97d5ade4a92a44f87d83fbe83b494090ecfdd3276720f4fb5b235614d0770411",
				s: "0xdba9d8d9f3e774850e63a02e19da252e246ddeec9e879be9fafef02246447299"
			});
		});

		it("should add 27 if V value is less that 27 and ordering is V, R, S", async () => {
			const rawSignature =
				"0x1c97d5ade4a92a44f87d83fbe83b494090ecfdd3276720f4fb5b235614d0770411dba9d8d9f3e774850e63a02e19da252e246ddeec9e879be9fafef02246447201";
			expect(nftTrading.parseRawSignature(rawSignature)).toEqual({
				v: 28,
				r: "0x1c97d5ade4a92a44f87d83fbe83b494090ecfdd3276720f4fb5b235614d07704",
				s: "0x11dba9d8d9f3e774850e63a02e19da252e246ddeec9e879be9fafef022464472"
			});
		});

		it("should add 27 if V value is less that 27 and ordering is R, S, V", async () => {
			const rawSignature =
				"0x0097d5ade4a92a44f87d83fbe83b494090ecfdd3276720f4fb5b235614d0770411dba9d8d9f3e774850e63a02e19da252e246ddeec9e879be9fafef02246447299";
			expect(nftTrading.parseRawSignature(rawSignature)).toEqual({
				v: 27,
				r: "0x97d5ade4a92a44f87d83fbe83b494090ecfdd3276720f4fb5b235614d0770411",
				s: "0xdba9d8d9f3e774850e63a02e19da252e246ddeec9e879be9fafef02246447299"
			});
		});
	});

	describe("buildOrder", () => {
		it("should build sell order from given inputs", async () => {
			const generateRandomV4OrderNonceSpy = jest
				.spyOn(nftTrading, "generateRandomV4OrderNonce")
				.mockReturnValue("113604032257357238510303590891918450986076622282835488971632849699550347132938");
			const result = nftTrading.buildOrder(
				"113604032257357238510303590891918450986076622282835488971632849699550347132938",
				"sell",
				11,
				1,
				"0xca1edbea332fe36a4164bfc85bc58de12f07f941"
			);
			expect(generateRandomV4OrderNonceSpy).toBeCalled();
			expect(result).toEqual({
				direction: 0,
				erc20Token: "0x6b175474e89094c44da98b954eedeac495271d0f",
				erc20TokenAmount: "11000000000000000000",
				erc1155Token: "0x0cfb090683ea58b740f583c348ff8730a82f3f64",
				erc1155TokenId: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
				erc1155TokenAmount: "1",
				erc1155TokenProperties: [],
				expiry: "2524604400",
				fees: [],
				maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
				nonce: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
				taker: "0x0000000000000000000000000000000000000000"
			});
		});

		it("should build buy order from given inputs", async () => {
			const generateRandomV4OrderNonceSpy = jest
				.spyOn(nftTrading, "generateRandomV4OrderNonce")
				.mockReturnValue("113604032257357238510303590891918450986076622282835488971632849699550347132938");
			const result = nftTrading.buildOrder(
				"113604032257357238510303590891918450986076622282835488971632849699550347132938",
				"buy",
				11,
				1,
				"0xca1edbea332fe36a4164bfc85bc58de12f07f941"
			);
			expect(generateRandomV4OrderNonceSpy).toBeCalled();
			expect(result).toEqual({
				direction: 1,
				erc20Token: "0x6b175474e89094c44da98b954eedeac495271d0f",
				erc20TokenAmount: "11000000000000000000",
				erc1155Token: "0x0cfb090683ea58b740f583c348ff8730a82f3f64",
				erc1155TokenId: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
				erc1155TokenAmount: "1",
				erc1155TokenProperties: [],
				expiry: "2524604400",
				fees: [],
				maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
				nonce: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
				taker: "0x0000000000000000000000000000000000000000"
			});
		});

		it("should build buy order with specific appId", async () => {
			const appId = "123123";
			const generateRandomV4OrderNonceSpy = jest
				.spyOn(nftTrading, "generateRandomV4OrderNonce")
				.mockReturnValue("113604032257357238510303590891918450986076622282835488971632849699550347132938");
			const result = nftTrading.buildOrder(
				"113604032257357238510303590891918450986076622282835488971632849699550347132938",
				"buy",
				11,
				1,
				"0xca1edbea332fe36a4164bfc85bc58de12f07f941",
				{ appId }
			);
			expect(generateRandomV4OrderNonceSpy).toBeCalledWith(appId);
			expect(result).toEqual({
				direction: 1,
				erc20Token: "0x6b175474e89094c44da98b954eedeac495271d0f",
				erc20TokenAmount: "11000000000000000000",
				erc1155Token: "0x0cfb090683ea58b740f583c348ff8730a82f3f64",
				erc1155TokenId: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
				erc1155TokenAmount: "1",
				erc1155TokenProperties: [],
				expiry: "2524604400",
				fees: [],
				maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
				nonce: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
				taker: "0x0000000000000000000000000000000000000000"
			});
		});
	});

	describe("generateRandomV4OrderNonce", () => {
		it("should throw error for invalid app id", async () => {
			const appId =
				"0x8a97d5ade4a92a44f87d83fbe83b494090ecfdd3276720f4fb5b235614d07411dba9d8d9f3e774850e63a02e19da252e246ddeec9e879be9fafef0224644721c";
			expect(() => {
				nftTrading.generateRandomV4OrderNonce(appId);
			}).toThrow(
				new TheaError({
					type: "INVALID_APP_ID",
					message: "Invalid appId"
				})
			);
		});

		it("should generate random v4 order nonce", async () => {
			const generateRandom128BitNumberSpy = jest
				.spyOn(nftTrading, "generateRandom128BitNumber")
				.mockReturnValue("238460575829711252461018443232353662505");
			const result = nftTrading.generateRandomV4OrderNonce();
			expect(generateRandom128BitNumberSpy).toBeCalled();
			expect(result).toEqual("100133271337000000000000000000000000000238460575829711252461018443232353662505");
		});
	});

	describe("generateRandom128BitNumber", () => {
		it("should generate random 128 bit number", async () => {
			const v4Spy = jest.spyOn(uuid, "v4").mockReturnValue("b365d61b563842679e5bdb846c873629");
			const result = nftTrading.generateRandom128BitNumber();
			expect(v4Spy).toBeCalled();
			expect(result).toEqual("238460575829711252461018443232353662505");
		});
	});
});
