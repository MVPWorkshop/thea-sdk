import { BigNumberish } from "@ethersproject/bignumber";
import { Contract, ContractTransaction } from "@ethersproject/contracts";

export interface ISwapRouterContract extends Contract {
	exactInputSingle(params: {
		tokenIn: string;
		tokenOut: string;
		fee: BigNumberish;
		recipient: string;
		deadline: BigNumberish;
		amountIn: BigNumberish;
		amountOutMinimum: BigNumberish;
		sqrtPriceLimitX96: BigNumberish;
	}): Promise<ContractTransaction>;
}
