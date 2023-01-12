import { IRegistryContract, ProviderOrSigner } from "../types";
import { ContractWrapper, REGISTRY_CONTRACT_ADDRESS, signerRequired } from "../utils";
import Registry_ABI from "../abi/Registry_ABI.json";
import { BigNumberish } from "@ethersproject/bignumber";
import { approve, checkBalance, execute } from "./shared";
import { Signer } from "@ethersproject/abstract-signer";
import { ContractReceipt } from "@ethersproject/contracts";

export class Offset extends ContractWrapper<IRegistryContract> {
	constructor(readonly providerOrSigner: ProviderOrSigner) {
		super(providerOrSigner, Registry_ABI, REGISTRY_CONTRACT_ADDRESS);
	}

	/**
	 * Burns `amount` of VCC tokens of type `id` and emits event. Backend listens to event and retires the corresponding offchain VCCs
	 * @param tokenId - VCC token id
	 * @param amount - amount of VCC tokens to burn
	 * @returns Transaction receipt
	 */
	async offsetNFT(tokenId: BigNumberish, amount: BigNumberish): Promise<ContractReceipt> {
		signerRequired(this.providerOrSigner);
		await checkBalance(this.providerOrSigner as Signer, { token: "ERC1155", tokenId, amount });

		await approve(this.providerOrSigner as Signer, {
			token: "ERC1155",
			spender: REGISTRY_CONTRACT_ADDRESS
		});

		return execute(this.contract.retire(tokenId, amount), { ...this.contractDetails, contractFunction: "retire" });
	}
}
