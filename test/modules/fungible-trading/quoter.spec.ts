import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Wallet } from "@ethersproject/wallet";
import { IQuoterContract, Quoter, TheaError, TheaNetwork, UniswapPoolFee } from "../../../src";
import { PRIVATE_KEY } from "../../mocks";

describe("Quoter", () => {
	const providerOrSigner = new Wallet(PRIVATE_KEY);
	let quoter: Quoter;
	const amountIn = BigNumber.from(1);

	const tokenIn = "0x3621027715647B69D706636a8878E85d725A2aed";
	const tokenOut = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
	const unknownTokenPool = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
	const amountOutLow = BigNumber.from(5);
	const amountOutMedium = BigNumber.from(10);
	const amountOutHigh = BigNumber.from(3);
	const mockContract: Partial<IQuoterContract> = {
		callStatic: {
			quoteExactInputSingle: jest
				.fn()
				.mockImplementation((...args: [string, string, BigNumberish, BigNumberish, BigNumberish]) => {
					const [tokenIn, , fee] = args;
					let result;

					if (tokenIn === unknownTokenPool || fee === UniswapPoolFee.LOWEST)
						result = Promise.reject(new Error("Pool not found"));
					else if (fee === UniswapPoolFee.HIGH) result = Promise.resolve(amountOutHigh);
					else if (fee === UniswapPoolFee.MEDIUM) result = Promise.resolve(amountOutMedium);
					else result = Promise.resolve(amountOutLow);

					return result;
				})
		}
	};
	const network = TheaNetwork.GANACHE;
	beforeEach(() => {
		quoter = new Quoter(providerOrSigner, network);
		quoter.contract = mockContract as IQuoterContract;
	});

	describe("quoteBestPrice", () => {
		it("should return amountOut", async () => {
			const quoteExactInputSingleSpy = jest.spyOn(quoter.contract.callStatic, "quoteExactInputSingle");
			const result = await quoter.quoteBestPrice(tokenIn, tokenOut, amountIn);
			expect(result).toBe(amountOutMedium);
			expect(quoteExactInputSingleSpy).toBeCalledTimes(4);
		});

		it("should fail if token contract address is invalid", async () => {
			await expect(quoter.quoteBestPrice("", tokenOut, amountIn)).rejects.toThrow(
				new TheaError({
					type: "INVALID_ADDRESS",
					message: "Passed address is not valid ethereum address"
				})
			);
		});

		it("should return 0 if non of pools were not found or something went wrong", async () => {
			const result = await quoter.quoteBestPrice(unknownTokenPool, tokenOut, amountIn);
			expect(result).toBe(0);
		});
	});
});
