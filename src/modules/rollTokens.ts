import { ProviderOrSigner, IBaseTokenManagerContract, ConvertEvent, TheaNetwork, RollTokensEvent } from "../types";
import { ContractWrapper, signerRequired, Events, consts, amountShouldBeGTZero } from "../utils";
import BaseTokenManager_ABI from "../abi/BaseTokenManager_ABI.json";
import { BigNumberish } from "@ethersproject/bignumber";
import { ContractReceipt, Event } from "@ethersproject/contracts";
import { approve, checkBalance, executeWithResponse } from "./shared";
import { Signer } from "@ethersproject/abstract-signer";

export class RollBaseTokens extends ContractWrapper<IBaseTokenManagerContract> {
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		super(providerOrSigner, BaseTokenManager_ABI, consts[`${network}`].baseTokenManagerContract);
	}

	/**
	 * Roll's old base tokens.Which includes burning specified amounts of the old base tokens and vintage tokens and minting new base tokens.
	 * @param vintage vintage to roll
	 * @param amount amount of tokens to roll
	 * @returns A promise fulfilled with the contract transaction.
	 */
	async rollTokens(vintage: BigNumberish, amount: BigNumberish): Promise<ContractReceipt & RollTokensEvent> {
		signerRequired(this.providerOrSigner);
		amountShouldBeGTZero(amount);

		await checkBalance(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			amount,
			tokenName: "CurrentNBT"
		});
		await checkBalance(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			amount,
			tokenName: "Vintage"
		});

		const spender = this.contractDetails.address;
		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			spender,
			amount,
			tokenName: "CurrentNBT"
		});

		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			spender,
			amount,
			tokenName: "Vintage"
		});

		return executeWithResponse<ConvertEvent>(
			this.contract.rollTokens(vintage, amount),
			{
				...this.contractDetails,
				contractFunction: "rollTokens"
			},
			this.extractInfoFromEvent
		);
	}

	extractInfoFromEvent(events?: Event[]): RollTokensEvent {
		const response: RollTokensEvent = { user: undefined, vintage: undefined, amount: undefined };
		if (events) {
			const event = events.find((event) => event.event === Events.rollTokens);
			if (event) {
				response.user = event.args?.user.toString();
				response.vintage = event.args?.vintage.toString();
				response.amount = event.args?.amount.toString();
			}
		}

		return response;
	}
}
