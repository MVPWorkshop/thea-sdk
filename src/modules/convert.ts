import { ProviderOrSigner, IBaseTokenManagerContract, ConvertEvent, TheaNetwork } from "../types";
import { ContractWrapper, signerRequired, Events, consts, amountShouldBeGTZero } from "../utils";
import BaseTokenManager_ABI from "../abi/BaseTokenManager_ABI.json";
import { BigNumberish } from "@ethersproject/bignumber";
import { ContractReceipt, Event } from "@ethersproject/contracts";
import { approve, checkBalance, executeWithResponse } from "./shared";
import { Signer } from "@ethersproject/abstract-signer";

export class Convert extends ContractWrapper<IBaseTokenManagerContract> {
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		super(providerOrSigner, BaseTokenManager_ABI, consts[`${network}`].baseTokenManagerContract);
	}

	/**
	 * Stores a request to convert the VCC NFT token of type `id`, locks the tokens and sends caller BaseTokens based on 'amount' sent and emits event.
	 * @param tokenId id of the VCC token
	 * @param amount amount of tokens to convert
	 * @returns A promise fulfilled with the contract transaction.
	 */
	async convertNFT(tokenId: BigNumberish, amount: BigNumberish): Promise<ContractReceipt & ConvertEvent> {
		signerRequired(this.providerOrSigner);
		amountShouldBeGTZero(amount);

		await checkBalance(this.providerOrSigner as Signer, this.network, { token: "ERC1155", tokenId, amount });

		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC1155",
			spender: this.contractDetails.address
		});

		return executeWithResponse<ConvertEvent>(
			this.contract.convert(tokenId, amount),
			{
				...this.contractDetails,
				contractFunction: "convert"
			},
			this.extractIdAndAmountFromEvent
		);
	}

	extractIdAndAmountFromEvent(events?: Event[]): ConvertEvent {
		const response: ConvertEvent = { id: undefined, amount: undefined };
		if (events) {
			const event = events.find((event) => event.event === Events.convert);
			if (event) {
				response.id = event.args?.tokenId.toString();
				response.amount = event.args?.amount.toString();
			}
		}

		return response;
	}
}
