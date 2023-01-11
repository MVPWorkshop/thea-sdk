import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Contract, ContractTransaction } from "@ethersproject/contracts";
import { PromiseOrValue } from ".";

export interface IERC20Contract extends Contract {
	allowance(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>): Promise<BigNumber>;
	approve(spender: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>): Promise<ContractTransaction>;
	balanceOf(owner: PromiseOrValue<string>): Promise<BigNumber>;
}
