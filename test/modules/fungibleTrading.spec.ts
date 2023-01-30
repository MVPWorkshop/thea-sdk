import { AlchemyProvider, TransactionResponse } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { AlphaRouter, CurrencyAmount, MethodParameters, SwapRoute } from "@uniswap/smart-order-router";
import { consts, FungibleTrading, TheaError, TheaNetwork } from "../../src";
import { CONTRACT_ADDRESS, PRIVATE_KEY, WALLET_ADDRESS } from "../mocks";
import * as utils from "../../src/utils/utils";
import * as shared from "../../src/modules/shared";
import { Percent } from "@uniswap/sdk-core";
import { BigNumber } from "@ethersproject/bignumber";

jest.mock("../../src/modules/shared", () => {
	return {
		checkBalance: jest.fn(),
		approve: jest.fn(),
		execute: jest.fn().mockImplementation(() => {
			return {};
		})
	};
});

jest.mock("../../src/modules/shared", () => {
	return {
		checkBalance: jest.fn(),
		approve: jest.fn(),
		execute: jest.fn().mockImplementation(() => {
			return {};
		})
	};
});

describe("Fungible Trading", () => {
	let fungibleTrading: FungibleTrading;
	const wallet = new Wallet(PRIVATE_KEY, new AlchemyProvider());
	const network = TheaNetwork.GOERLI;
	consts[`${network}`].currentNbtTokenContract = CONTRACT_ADDRESS;
	const tokenIn = utils.getToken(network, "CurrentNBT");
	const tokenOut = utils.getToken(network, "Stable");
	const quote: Partial<CurrencyAmount> = {
		toExact: () => "13"
	};
	const methodParameters: Partial<MethodParameters> = {
		calldata: "0x",
		value: "1"
	};
	const route: Partial<SwapRoute> = {
		quote: quote as CurrencyAmount,
		methodParameters: methodParameters as MethodParameters
	};
	beforeEach(() => {
		fungibleTrading = new FungibleTrading(wallet, network);
	});

	describe("initizalization", () => {
		it("should throw error if signer is missing provider", () => {
			expect(() => new FungibleTrading(new Wallet(PRIVATE_KEY), network)).toThrow(
				new TheaError({
					type: "BASE_PROVIDER_REQUIRED",
					message: "Base provider required for getting best swap route"
				})
			);
		});

		it("should make instance of AlphaRouter", () => {
			expect(fungibleTrading.router).toBeInstanceOf(AlphaRouter);
		});
	});

	describe("queryTokenPrice", () => {
		it("should return price of token", async () => {
			const findBestRouteSpy = jest.spyOn(fungibleTrading, "findBestRoute").mockResolvedValueOnce(route as SwapRoute);
			const ethToWeiSpy = jest.spyOn(utils, "ethToWei");
			const price = await fungibleTrading.queryTokenPrice({
				tokenIn: "CurrentNBT",
				amountIn: "1",
				recipient: WALLET_ADDRESS
			});

			expect(price).toBe("13000000000000000000");
			expect(ethToWeiSpy).toBeCalledWith("13");
			expect(findBestRouteSpy).toBeCalledWith(tokenIn, tokenOut, {
				amountIn: "1",
				recipient: WALLET_ADDRESS,
				slippageTolerance: new Percent(0.5 * 100, 10000),
				deadline: expect.any(Number)
			});
		});

		it("should return null if coun't find route", async () => {
			jest.spyOn(fungibleTrading, "findBestRoute").mockResolvedValueOnce(null);

			const price = await fungibleTrading.queryTokenPrice({
				tokenIn: "CurrentNBT",
				amountIn: "1",
				recipient: WALLET_ADDRESS
			});

			expect(price).toBeNull();
		});
	});

	describe("swapTokens", () => {
		const sysTime = new Date(2022, 0, 1);
		beforeAll(() => {
			jest.useFakeTimers();
			jest.setSystemTime(sysTime);
		});

		afterAll(() => {
			jest.useRealTimers();
		});

		const spender = consts[`${network}`].swapRouterContract;
		it("should swap tokens", async () => {
			const contractTransaction: Partial<TransactionResponse> = {
				wait: jest.fn().mockResolvedValue({
					to: spender,
					from: "0x123",
					contractAddress: spender
				})
			};
			const findBestRouteSpy = jest.spyOn(fungibleTrading, "findBestRoute").mockResolvedValueOnce(route as SwapRoute);
			const sendTransactionSpy = jest
				.spyOn(wallet, "sendTransaction")
				.mockResolvedValueOnce(contractTransaction as TransactionResponse);
			const executeSpy = jest.spyOn(shared, "execute");
			const checkBalanceSpy = jest.spyOn(shared, "checkBalance");
			const approveSpy = jest.spyOn(shared, "approve");

			await fungibleTrading.swapTokens({ tokenIn: "CurrentNBT", amountIn: "1", recipient: WALLET_ADDRESS });

			expect(checkBalanceSpy).toBeCalledWith(wallet, network, {
				token: "ERC20",
				tokenName: "CurrentNBT",
				amount: "1000000000000000000"
			});
			expect(approveSpy).toBeCalledWith(wallet, network, {
				token: "ERC20",
				tokenName: "CurrentNBT",
				amount: "1000000000000000000",
				spender
			});
			expect(findBestRouteSpy).toBeCalledWith(tokenIn, tokenOut, {
				amountIn: "1",
				recipient: WALLET_ADDRESS,
				slippageTolerance: new Percent(0.5 * 100, 10000),
				deadline: expect.any(Number)
			});
			expect(sendTransactionSpy).toBeCalledWith({
				data: methodParameters.calldata,
				to: spender,
				value: BigNumber.from(methodParameters.value),
				from: WALLET_ADDRESS
			});
			expect(executeSpy).toBeCalledWith(expect.any(Promise), {
				address: spender,
				contractFunction: "tokenSwap",
				name: "SwapRouter"
			});
		});

		it("should be called with passed deadline", async () => {
			const deadline = sysTime.getTime() + 1000;
			const contractTransaction: Partial<TransactionResponse> = {
				wait: jest.fn().mockResolvedValue({
					to: spender,
					from: "0x123",
					contractAddress: spender
				})
			};
			const findBestRouteSpy = jest.spyOn(fungibleTrading, "findBestRoute").mockResolvedValueOnce(route as SwapRoute);
			jest.spyOn(wallet, "sendTransaction").mockResolvedValueOnce(contractTransaction as TransactionResponse);

			await fungibleTrading.swapTokens(
				{ tokenIn: "CurrentNBT", amountIn: "1", recipient: WALLET_ADDRESS },
				{ deadline }
			);

			expect(findBestRouteSpy).toBeCalledWith(tokenIn, tokenOut, {
				amountIn: "1",
				recipient: WALLET_ADDRESS,
				slippageTolerance: new Percent(0.5 * 100, 10000),
				deadline
			});
		});

		it("should be called with stable coin as token in", async () => {
			const deadline = sysTime.getTime() + 1000;
			const contractTransaction: Partial<TransactionResponse> = {
				wait: jest.fn().mockResolvedValue({
					to: spender,
					from: "0x123",
					contractAddress: spender
				})
			};
			const findBestRouteSpy = jest.spyOn(fungibleTrading, "findBestRoute").mockResolvedValueOnce(route as SwapRoute);
			jest.spyOn(wallet, "sendTransaction").mockResolvedValueOnce(contractTransaction as TransactionResponse);

			await fungibleTrading.swapTokens(
				{ tokenIn: "Stable", tokenOut: "CurrentNBT", amountIn: "1", recipient: WALLET_ADDRESS },
				{ deadline }
			);

			expect(findBestRouteSpy).toBeCalledWith(tokenOut, tokenIn, {
				amountIn: "1",
				recipient: WALLET_ADDRESS,
				slippageTolerance: new Percent(0.5 * 100, 10000),
				deadline
			});
		});

		it("should throw error if providerOrSigner is not signer", async () => {
			const trading = new FungibleTrading(new AlchemyProvider(), network);
			await expect(
				trading.swapTokens({ tokenIn: "CurrentNBT", amountIn: "1", recipient: WALLET_ADDRESS })
			).rejects.toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});

		it("should throw error if cound't find swap route", async () => {
			jest.spyOn(fungibleTrading, "findBestRoute").mockResolvedValueOnce(null);
			await expect(
				fungibleTrading.swapTokens({ tokenIn: "CurrentNBT", amountIn: "1", recipient: WALLET_ADDRESS })
			).rejects.toThrow(
				new TheaError({
					type: "ERROR_FINDING_SWAP_ROUTE",
					message: "Could not find a swap route"
				})
			);
		});

		it("should throw error if invalid deadline was passed", async () => {
			await expect(
				fungibleTrading.swapTokens(
					{ tokenIn: "CurrentNBT", amountIn: "1", recipient: WALLET_ADDRESS },
					{ deadline: 1000 }
				)
			).rejects.toThrow(new TheaError({ type: "INVALID_DEADLINE", message: "Deadline can't be in past" }));
		});

		it("should throw error if invalid slippage tollerance was passed", async () => {
			await expect(
				fungibleTrading.swapTokens(
					{ tokenIn: "CurrentNBT", amountIn: "1", recipient: WALLET_ADDRESS },
					{ slippageTolerance: 1000 }
				)
			).rejects.toThrow(
				new TheaError({
					type: "INVALID_SLIPPAGE_TOLERANCE_VALUE",
					message: "Slippage tolerance can't be greater than 1 or less then 0"
				})
			);
		});
	});

	describe("findBestRoute", () => {
		it("should return swap route", async () => {
			const amountShouldBeGTZeroSpy = jest.spyOn(utils, "amountShouldBeGTZero");
			const routerSpy = jest.spyOn(fungibleTrading.router, "route").mockResolvedValueOnce(route as SwapRoute);
			const result = await fungibleTrading.findBestRoute(tokenIn, tokenOut, {
				amountIn: "1",
				recipient: WALLET_ADDRESS,
				slippageTolerance: new Percent(0.5 * 100, 10000),
				deadline: 1000
			});

			expect(routerSpy).toBeCalled();
			expect(result).toBeDefined();
			expect(amountShouldBeGTZeroSpy).toBeCalledWith("1");
		});

		it("should throw error if amount in is not bigger then 0", async () => {
			await expect(
				fungibleTrading.findBestRoute(tokenIn, tokenOut, {
					amountIn: "0",
					recipient: WALLET_ADDRESS,
					slippageTolerance: new Percent(0.5 * 100, 10000),
					deadline: 1000
				})
			).rejects.toThrow(
				new TheaError({
					type: "INVALID_TOKEN_AMOUNT_VALUE",
					message: "Amount should be greater than 0"
				})
			);
		});
	});
});
