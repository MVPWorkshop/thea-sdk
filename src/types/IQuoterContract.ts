import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";

export interface IQuoterContract extends Contract {
	callStatic: {
		quoteExactInputSingle(
			tokenIn: string,
			tokenOut: string,
			fee: BigNumberish,
			amountIn: BigNumberish,
			sqrtPriceLimitX96: BigNumberish
		): Promise<BigNumber>;
	};
}
