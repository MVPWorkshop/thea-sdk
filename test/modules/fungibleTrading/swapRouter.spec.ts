import { ContractTransaction } from "@ethersproject/contracts";
import { Wallet } from "@ethersproject/wallet";
import { consts, ExactInputSingleParams, ISwapRouterContract, SwapRouter, TheaError, TheaNetwork } from "../../../src";
import { PRIVATE_KEY, WALLET_ADDRESS } from "../../mocks";
import * as shared from "../../../src/modules/shared";
import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider } from "@ethersproject/providers";

const swapRouterContractAddress = consts[TheaNetwork.GANACHE].swapRouterContract;
jest.mock("../../../src/modules/shared", () => {
	return {
		checkBalance: jest.fn(),
		approve: jest.fn(),
		execute: jest.fn().mockImplementation(() => {
			return {
				to: swapRouterContractAddress,
				from: "0x123",
				contractAddress: swapRouterContractAddress,
				requestId: "1"
			};
		})
	};
});

describe("Swap Router", () => {
	const providerOrSigner = new Wallet(PRIVATE_KEY);
	let swapRouter: SwapRouter;

	const contractTransaction: Partial<ContractTransaction> = {
		wait: jest.fn().mockResolvedValue({
			to: swapRouterContractAddress,
			from: "0x123",
			contractAddress: swapRouterContractAddress
		})
	};

	const mockContract: Partial<ISwapRouterContract> = {
		exactInputSingle: jest.fn().mockResolvedValue(contractTransaction as ContractTransaction)
	};
	const network = TheaNetwork.GANACHE;
	let exactInputSingleParams: ExactInputSingleParams;
	beforeEach(() => {
		swapRouter = new SwapRouter(providerOrSigner, network);
		swapRouter.contract = mockContract as ISwapRouterContract;
		exactInputSingleParams = {
			tokenIn: consts[`${network}`].sdgTokenContract,
			tokenOut: consts[`${network}`].stableTokenContract,
			fee: 3000,
			recipient: WALLET_ADDRESS,
			deadline: 1620000000,
			amountIn: "1000000000000000000",
			amountOutMinimum: "1000000000000000000",
			sqrtPriceLimitX96: 0
		};
	});

	describe("swap", () => {
		it("should call exactInputSingle function of SwapRouter contract to swap tokens", async () => {
			const checkBalanceSpy = jest.spyOn(shared, "checkBalance");
			const approveSpy = jest.spyOn(shared, "approve");
			const exactInputSingleSpy = jest.spyOn(swapRouter.contract, "exactInputSingle");
			const executeSpy = jest.spyOn(shared, "execute");

			const result = await swapRouter.swap(exactInputSingleParams, "SDG");

			expect(checkBalanceSpy).toBeCalledWith(providerOrSigner as Signer, network, {
				token: "ERC20",
				amount: exactInputSingleParams.amountIn,
				tokenName: "SDG"
			});

			expect(approveSpy).toBeCalledWith(providerOrSigner as Signer, network, {
				token: "ERC20",
				amount: exactInputSingleParams.amountIn,
				tokenName: "SDG",
				spender: swapRouterContractAddress
			});

			expect(exactInputSingleSpy).toBeCalledWith(exactInputSingleParams);

			expect(executeSpy).toHaveBeenCalled();

			expect(result).toMatchObject({
				to: swapRouterContractAddress,
				from: "0x123",
				contractAddress: swapRouterContractAddress
			});
		});

		it("should fail if providerOrSigner is not signer", async () => {
			swapRouter = new SwapRouter(new JsonRpcProvider(), network);

			expect(swapRouter.swap(exactInputSingleParams, "SDG")).rejects.toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});

		it("should fail if tokenIn address is not valid ethereum address", async () => {
			exactInputSingleParams.tokenIn = "0x123";
			expect(swapRouter.swap(exactInputSingleParams, "SDG")).rejects.toThrow(
				new TheaError({
					type: "INVALID_ADDRESS",
					message: "Passed address is not valid ethereum address"
				})
			);
		});

		it("should fail if tokenOut address is not valid ethereum address", async () => {
			exactInputSingleParams.tokenOut = "0x123";
			expect(swapRouter.swap(exactInputSingleParams, "SDG")).rejects.toThrow(
				new TheaError({
					type: "INVALID_ADDRESS",
					message: "Passed address is not valid ethereum address"
				})
			);
		});

		it("should fail if recipient address is not valid ethereum address", async () => {
			exactInputSingleParams.recipient = "0x123";
			expect(swapRouter.swap(exactInputSingleParams, "SDG")).rejects.toThrow(
				new TheaError({
					type: "INVALID_ADDRESS",
					message: "Passed address is not valid ethereum address"
				})
			);
		});
	});
	// describe("unwrapToken", () => {
	// 	it("should throw error that signer is required", async () => {
	// 		unwrap = new Unwrap(new JsonRpcProvider(), network);
	// 		await expect(unwrap.unwrapToken(tokenId, amount, offchainAccount)).rejects.toThrow(
	// 			new TheaError({
	// 				type: "SIGNER_REQUIRED",
	// 				message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
	// 			})
	// 		);
	// 	});

	// 	it("should throw error if amount is not valid", async () => {
	// 		await expect(unwrap.unwrapToken(tokenId, BigNumber.from(1001), offchainAccount)).rejects.toThrow(
	// 			new TheaError({
	// 				type: "INVALID_TOKEN_AMOUNT_VALUE",
	// 				message: "Amount should be a ton. Value must be greater than 0 and divisible by 1000"
	// 			})
	// 		);
	// 	});

	// 	it("should call unwrap method from contract", async () => {
	// 		const txPromise = Promise.resolve(contractTransaction as ContractTransaction);
	// 		const unwrapSpy = jest.spyOn(unwrap.contract, "unwrap").mockReturnValue(txPromise);
	// 		const checkBalanceSpy = jest.spyOn(shared, "checkBalance");
	// 		const approveSpy = jest.spyOn(shared, "approve");
	// 		const executeSpy = jest.spyOn(shared, "executeWithResponse");

	// 		const result = await unwrap.unwrapToken(tokenId, amount, offchainAccount);
	// 		expect(result.requestId).toBe("1");
	// 		expect(checkBalanceSpy).toHaveBeenCalledWith(providerOrSigner, network, { token: "ERC1155", tokenId, amount });
	// 		expect(approveSpy).toHaveBeenCalledWith(providerOrSigner, network, {
	// 			token: "ERC1155",
	// 			spender: registryContractAddress
	// 		});
	// 		expect(executeSpy).toHaveBeenCalledWith(
	// 			txPromise,
	// 			{
	// 				name: Registry_ABI.contractName,
	// 				address: registryContractAddress,
	// 				contractFunction: "unwrap"
	// 			},
	// 			unwrap.extractRequestIdFromEvent
	// 		);
	// 		expect(unwrapSpy).toHaveBeenCalledWith(tokenId, amount, offchainAccount);
	// 		expect(result).toMatchObject({
	// 			to: registryContractAddress,
	// 			from: "0x123",
	// 			contractAddress: registryContractAddress
	// 		});
	// 	});
	// });

	// describe("extractRequestIdFromEvent", () => {
	// 	it("should return undefined request id if no events passed", () => {
	// 		const result = unwrap.extractRequestIdFromEvent();
	// 		expect(result.requestId).toBeUndefined();
	// 	});

	// 	it("should return undefined request id if no Unwrap event passed", () => {
	// 		const result = unwrap.extractRequestIdFromEvent([]);
	// 		expect(result.requestId).toBeUndefined();
	// 	});

	// 	it("should return undefined request id if args in event", () => {
	// 		const event: Partial<Event> = {
	// 			event: Events.unwrap
	// 		};
	// 		const result = unwrap.extractRequestIdFromEvent([event as Event]);
	// 		expect(result.requestId).toBeUndefined();
	// 	});

	// 	/* eslint-disable  @typescript-eslint/no-explicit-any */
	// 	it("should extract request id from event", () => {
	// 		const requestId = "1";
	// 		const event: Partial<Event> = {
	// 			event: Events.unwrap,
	// 			args: { requestId } as any
	// 		};
	// 		const result = unwrap.extractRequestIdFromEvent([event as Event]);
	// 		expect(result.requestId).toBe("1");
	// 	});
	// });
	// describe("getUnwrapTokenState", () => {
	// 	it("should call requests mapping from contract", async () => {
	// 		const requestsSpy = jest.spyOn(unwrap.contract, "requests");

	// 		const result = await unwrap.getUnwrapTokenState(1);

	// 		expect(result).toEqual({ status: 0, maker: "0x123", tokenId: tokenId.toString(), amount: amount.toString() });
	// 		expect(requestsSpy).toHaveBeenCalledWith(1);
	// 	});

	// 	it("should throw error if tokenId is not valid", async () => {
	// 		await expect(unwrap.getUnwrapTokenState(0)).rejects.toThrow(
	// 			new TheaError({
	// 				type: "INVALID_REQUEST_ID_VALUE",
	// 				message: "Request id should be greater than 0"
	// 			})
	// 		);
	// 	});
	// });
});
