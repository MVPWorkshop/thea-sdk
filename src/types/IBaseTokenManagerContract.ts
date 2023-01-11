import { Contract, ContractTransaction } from "@ethersproject/contracts";
import { PromiseOrValue, TransactionOptions } from ".";
import { BigNumberish } from "@ethersproject/bignumber";

export interface IBaseTokenManagerContract extends Contract {
	convert(
		id: PromiseOrValue<BigNumberish>,
		amount: PromiseOrValue<BigNumberish>,
		overrides?: TransactionOptions
	): Promise<ContractTransaction>;
}
