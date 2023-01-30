import { IERC1155Contract, ProviderOrSigner, TheaNetwork } from "../../types";
import { consts, ContractWrapper, TheaError, validateAddress } from "../../utils";
import TheaERC1155_ABI from "../../abi/TheaERC1155_ABI.json";
import { execute } from "./execute";
import { BigNumberish } from "@ethersproject/bignumber";
import { ContractReceipt } from "@ethersproject/contracts";

export class TheaERC1155 extends ContractWrapper<IERC1155Contract> {
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		super(providerOrSigner, TheaERC1155_ABI, consts[`${network}`].theaERC1155Contract);
	}

	async checkERC1155Balance(owner: string, tokenId: BigNumberish, amount: BigNumberish): Promise<void> {
		const balance = await this.contract.balanceOf(owner, tokenId);
		if (balance.lt(amount)) {
			throw new TheaError({ type: "INSUFFICIENT_FUNDS", message: "Insufficient Thea ERC1155 funds" });
		}
	}

	async approveERC1155(owner: string, spender: string): Promise<void> {
		const isApproved = await this.isApprovedForAll(owner, spender);
		if (!isApproved) {
			await this.setApprovalForAll(spender);
		}
		return;
	}

	async isApprovedForAll(owner: string, spender: string): Promise<boolean> {
		validateAddress(owner);
		validateAddress(spender);
		return this.contract.isApprovedForAll(owner, spender);
	}

	async setApprovalForAll(spender: string): Promise<ContractReceipt> {
		validateAddress(spender);
		return execute(this.contract.setApprovalForAll(spender, true), {
			...this.contractDetails,
			contractFunction: "setApprovalForAll"
		});
	}
}
