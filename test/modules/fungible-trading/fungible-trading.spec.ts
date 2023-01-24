import { BigNumber } from "@ethersproject/bignumber";
import { Wallet } from "@ethersproject/wallet";
import { consts, FungibleTrading, TheaNetwork } from "../../../src";
import { PRIVATE_KEY } from "../../mocks";

jest.mock("../../../src/modules/fungible-trading/quoter", () => {
	return {
		Quoter: jest.fn().mockImplementation(() => {
			return {
				quoteBestPrice: jest.fn().mockResolvedValue(BigNumber.from(200))
			};
		})
	};
});
describe("Fungible Trading", () => {
	let fungibleTrading: FungibleTrading;
	const wallet = new Wallet(PRIVATE_KEY);
	const amount = BigNumber.from(100);
	const network = TheaNetwork.GANACHE;
	beforeEach(() => {
		fungibleTrading = new FungibleTrading(wallet, network);
	});

	describe("queryTokenPrice", () => {
		it("should return token price from stable coin to token", async () => {
			const queryTokenPriceSpy = jest.spyOn(fungibleTrading.quoter, "quoteBestPrice");
			const result = await fungibleTrading.queryTokenPrice({
				tokenIn: "DAI",
				tokenOut: "SDG",
				amount
			});

			expect(queryTokenPriceSpy).toBeCalledWith(
				consts[`${network}`].stableTokenContract,
				consts[`${network}`].sdgTokenContract,
				amount
			);
			expect(result).toEqual(BigNumber.from(200));
		});

		it("should return token price from token to stable coin ", async () => {
			const queryTokenPriceSpy = jest.spyOn(fungibleTrading.quoter, "quoteBestPrice");
			const result = await fungibleTrading.queryTokenPrice({
				tokenIn: "SDG",
				amount
			});

			expect(queryTokenPriceSpy).toBeCalledWith(
				consts[`${network}`].sdgTokenContract,
				consts[`${network}`].stableTokenContract,
				amount
			);
			expect(result).toEqual(BigNumber.from(200));
		});
	});
});
