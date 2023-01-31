import { BigNumber } from "@ethersproject/bignumber";
import { Wallet } from "@ethersproject/wallet";
import { IQuoterContract, POOL_FEE, Quoter, TheaError, TheaNetwork } from "../../../src";
import { PRIVATE_KEY } from "../../mocks";

describe("Quoter", () => {
	const providerOrSigner = new Wallet(PRIVATE_KEY);
	let quoter: Quoter;
	const amountIn = BigNumber.from(1);

	const tokenIn = "0x3621027715647B69D706636a8878E85d725A2aed";
	const tokenOut = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
	const amountOut = BigNumber.from(20);
	const mockContract: Partial<IQuoterContract> = {
		callStatic: {
			quoteExactInputSingle: jest.fn().mockResolvedValue(amountOut)
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
			expect(result.toString()).toBe(amountOut.toString());
			expect(quoteExactInputSingleSpy).toBeCalledWith(tokenIn, tokenOut, POOL_FEE, amountIn, 0);
		});

		it("should fail if token contract address is invalid", async () => {
			await expect(quoter.quoteBestPrice("", tokenOut, amountIn)).rejects.toThrow(
				new TheaError({
					type: "INVALID_ADDRESS",
					message: "Passed address is not valid ethereum address"
				})
			);
		});
	});
});
