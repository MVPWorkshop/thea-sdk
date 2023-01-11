import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Contract, ContractTransaction } from "@ethersproject/contracts";
import { PromiseOrValue } from ".";

export interface IERC1155Contract extends Contract {
	isApprovedForAll(account: PromiseOrValue<string>, operator: PromiseOrValue<string>): Promise<boolean>;
	setApprovalForAll(operator: PromiseOrValue<string>, approved: PromiseOrValue<boolean>): Promise<ContractTransaction>;
	balanceOf(account: PromiseOrValue<string>, id: PromiseOrValue<BigNumberish>): Promise<BigNumber>;
}
