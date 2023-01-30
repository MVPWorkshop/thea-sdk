import { BigNumber } from "@ethersproject/bignumber";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { consts, FungibleTrading, TheaError, TheaNetwork, UniswapPoolFee } from "../../../src";
import { PRIVATE_KEY, WALLET_ADDRESS } from "../../mocks";

jest.mock("../../../src/modules/fungibleTrading/quoter", () => {
	return {
		Quoter: jest.fn().mockImplementation(() => {
			return {
				quoteBestPrice: jest.fn().mockResolvedValue({ amountOut: BigNumber.from(200), fee: UniswapPoolFee.MEDIUM })
			};
		})
	};
});

jest.mock("../../../src/modules/fungibleTrading/swapRouter", () => {
	return {
		SwapRouter: jest.fn().mockImplementation(() => {
			return {
				swap: jest.fn().mockResolvedValue({ to: "0x123", from: "0x123", contractAddress: "0x123" })
			};
		})
	};
});
describe("Fungible Trading", () => {
	let fungibleTrading: FungibleTrading;
	const wallet = new Wallet(PRIVATE_KEY);
	const amount = BigNumber.from(100);
	const network = TheaNetwork.GANACHE;
	const amountOut = BigNumber.from(200);
	beforeEach(() => {
		fungibleTrading = new FungibleTrading(wallet, network);
	});

	describe("queryTokenPrice", () => {
		it("should return token price from stable coin to token", async () => {
			const queryTokenPriceSpy = jest.spyOn(fungibleTrading.quoter, "quoteBestPrice");
			const result = await fungibleTrading.queryTokenPrice({
				tokenIn: "Stable",
				tokenOut: "SDG",
				amountIn: amount
			});

			expect(queryTokenPriceSpy).toBeCalledWith(
				consts[`${network}`].stableTokenContract,
				consts[`${network}`].sdgTokenContract,
				amount
			);
			expect(result).toEqual(amountOut.toString());
		});

		it("should return token price from token to stable coin ", async () => {
			const queryTokenPriceSpy = jest.spyOn(fungibleTrading.quoter, "quoteBestPrice");
			const result = await fungibleTrading.queryTokenPrice({
				tokenIn: "SDG",
				amountIn: amount
			});

			expect(queryTokenPriceSpy).toBeCalledWith(
				consts[`${network}`].sdgTokenContract,
				consts[`${network}`].stableTokenContract,
				amount
			);
			expect(result).toEqual(amountOut.toString());
		});
	});

	describe("swapTokens", () => {
		beforeAll(() => {
			jest.useFakeTimers();
			jest.setSystemTime(new Date(2022, 0, 1));
		});

		afterAll(() => {
			jest.useRealTimers();
		});

		const tokenInAddr = consts[`${network}`].sdgTokenContract;
		const stableTokenAddr = consts[`${network}`].stableTokenContract;
		it("should swap tokens", async () => {
			const quoteBestPriceSpy = jest.spyOn(fungibleTrading.quoter, "quoteBestPrice");
			const swapSpy = jest.spyOn(fungibleTrading.swapRouter, "swap");

			const result = await fungibleTrading.swapTokens({ amountIn: amount, tokenIn: "SDG" });

			expect(quoteBestPriceSpy).toHaveBeenCalledWith(tokenInAddr, stableTokenAddr, amount);

			expect(swapSpy).toHaveBeenCalledWith(
				{
					tokenIn: tokenInAddr,
					tokenOut: stableTokenAddr,
					fee: UniswapPoolFee.MEDIUM,
					recipient: WALLET_ADDRESS,
					deadline: 1640993400,
					amountIn: amount,
					amountOutMinimum: BigNumber.from(199),
					sqrtPriceLimitX96: 0
				},
				"SDG"
			);

			expect(result).toMatchObject({ to: "0x123", from: "0x123", contractAddress: "0x123" });
		});

		it("should throw error if providerOrSigner is not a signer", async () => {
			const fungibleTrading = new FungibleTrading(new JsonRpcProvider(), network);
			await expect(fungibleTrading.swapTokens({ amountIn: amount, tokenIn: "SDG" })).rejects.toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});

		it("should fail if quoter returns 0 amountOut", async () => {
			jest.spyOn(fungibleTrading.quoter, "quoteBestPrice").mockResolvedValue({ amountOut: 0, fee: 500 });
			await expect(fungibleTrading.swapTokens({ amountIn: amount, tokenIn: "SDG" })).rejects.toThrow(
				new TheaError({ type: "INVALID_TOKEN_PRICE", message: "Coudn't fetch best token price from pair pools" })
			);
		});

		it("should fail if invalid slippage tollerance value was passed", async () => {
			await expect(
				fungibleTrading.swapTokens({ amountIn: amount, tokenIn: "SDG" }, { slippageTolerance: 1.1 })
			).rejects.toThrow(
				new TheaError({
					type: "INVALID_SLIPPAGE_TOLERANCE_VALUE",
					message: "Slippage tolerance can't be greater than 1 or less then 0"
				})
			);
		});

		it("should extract swap options", async () => {
			const swapOptions = { slippageTolerance: 1, deadline: Date.now() + 100000, recipient: "0x123" };
			const swapSpy = jest.spyOn(fungibleTrading.swapRouter, "swap");
			await fungibleTrading.swapTokens({ amountIn: amount, tokenIn: "SDG" }, swapOptions);

			expect(swapSpy).toHaveBeenCalledWith(
				{
					tokenIn: tokenInAddr,
					tokenOut: stableTokenAddr,
					fee: UniswapPoolFee.MEDIUM,
					recipient: swapOptions.recipient,
					deadline: swapOptions.deadline,
					amountIn: amount,
					amountOutMinimum: BigNumber.from(198),
					sqrtPriceLimitX96: 0
				},
				"SDG"
			);
		});

		it("should throw error if deadline is in past", async () => {
			const swapOptions = { slippageTolerance: 1, deadline: 1000, recipient: "0x123" };
			await expect(fungibleTrading.swapTokens({ amountIn: amount, tokenIn: "SDG" }, swapOptions)).rejects.toThrow(
				new TheaError({ type: "INVALID_DEADLINE", message: "Deadline can't be in past" })
			);
		});
	});
});
