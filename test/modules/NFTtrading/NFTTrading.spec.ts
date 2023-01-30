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
	STABLE_TOKEN_DECIMALS_MULTIPLIER
} from "../../../src";
import * as shared from "../../../src/modules/shared";
import * as uuid from "uuid";
import { postOrderResponseMock, PRIVATE_KEY } from "../../mocks";

const exchangeProxyContractAddress = consts[TheaNetwork.GANACHE].exchangeProxyAddress;

jest.mock("../../../src/modules/shared", () => {
	return {
		checkBalance: jest.fn(),
		approve: jest.fn()
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

	const contractTransaction: Partial<ContractTransaction> = {
		wait: jest.fn().mockResolvedValue({
			to: exchangeProxyContractAddress,
			from: "0x123",
			contractAddress: null
		})
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

	const mockContract: Partial<IZeroExContract> = {
		cancelERC1155Order: jest.fn().mockResolvedValue(contractTransaction as ContractTransaction)
	};

	const network = TheaNetwork.GANACHE;

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
			const result = await nftTrading.cancelOrder(orderId);
			expect(result).toMatchObject({
				to: exchangeProxyContractAddress,
				from: "0x123",
				contractAddress: null
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

		it("should call cancel previous order and post new one to orderbook", async () => {
			const price = 10;
			const quantity = 1;
			const cancelOrderTxPromise = Promise.resolve(contractTransaction as ContractTransaction);
			const canceclOrderSpy = jest
				.spyOn(nftTrading.contract, "cancelERC1155Order")
				.mockReturnValue(cancelOrderTxPromise);
			const enterNftLimitTxPromise = Promise.resolve(postOrderResponseMock as PostOrderResponsePayload);
			const enterNftLimitSpy = jest.spyOn(nftTrading, "enterNFTLimit").mockReturnValue(enterNftLimitTxPromise);
			const queryOrderByNonceSpy = jest
				.spyOn(nftTrading.orderBook, "queryOrderByNonce")
				.mockResolvedValue(queryOrderByNonceTransaction as PostOrderResponsePayload);
			const result = await nftTrading.updateOrder(orderId, price, quantity);
			expect(canceclOrderSpy).toHaveBeenCalled();
			expect(queryOrderByNonceSpy).toHaveBeenCalled();
			expect(enterNftLimitSpy).toHaveBeenCalled();
			expect(result).toMatchObject(postOrderResponseMock);
		});
	});

	describe("enterNFTLimit", () => {
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
			expect(result).toMatchObject(postOrderResponseMock);
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
				amount: stableTokenAmount,
				tokenName: "Stable",
				spender: exchangeProxyContractAddress
			});
			expect(result).toMatchObject(postOrderResponseMock);
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
