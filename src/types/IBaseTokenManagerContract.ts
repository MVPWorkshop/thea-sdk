import { Contract, ContractTransaction } from "@ethersproject/contracts";
import { BaseTokenCharactaristics, PromiseOrValue, TransactionOptions } from ".";
import { BigNumberish } from "@ethersproject/bignumber";

export interface IBaseTokenManagerContract extends Contract {
	convert(
		id: PromiseOrValue<BigNumberish>,
		amount: PromiseOrValue<BigNumberish>,
		overrides?: TransactionOptions
	): Promise<ContractTransaction>;

	rollTokens(
		id: PromiseOrValue<BigNumberish>,
		amount: PromiseOrValue<BigNumberish>,
		overrides?: TransactionOptions
	): Promise<ContractTransaction>;

	recover(
		id: PromiseOrValue<BigNumberish>,
		amount: PromiseOrValue<BigNumberish>,
		overrides?: TransactionOptions
	): Promise<ContractTransaction>;

	baseCharacteristics(): Promise<BaseTokenCharactaristics>;

	baseTokens(arg0: PromiseOrValue<BigNumberish>): Promise<string>;
}
