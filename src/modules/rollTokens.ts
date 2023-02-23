import { ProviderOrSigner, IBaseTokenManagerContract, ConvertEvent, TheaNetwork, RollTokensEvent } from "../types";
import { ContractWrapper, signerRequired, Events, consts, amountShouldBeGTZero, TheaError, getAddress } from "../utils";
import BaseTokenManager_ABI from "../abi/BaseTokenManager_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { ContractReceipt, Event } from "@ethersproject/contracts";
import { approve, checkBalance, executeWithResponse, TheaERC20 } from "./shared";
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

		const address = await this.getBaseTokenAddressByVintage(parseInt(vintage.toString()));

		const token = new TheaERC20(this.providerOrSigner, address);
		const owner = await getAddress(this.providerOrSigner as Signer);

		// Check balance of old base tokens
		await token.checkERC20Balance(owner, amount);

		await checkBalance(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			amount,
			tokenName: "Vintage"
		});

		const spender = this.contractDetails.address;

		// Approve old base tokens
		await token.approveERC20(owner, spender, amount);

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

	private async getBaseTokenAddressByVintage(vintage: number): Promise<string> {
		const address = await this.contract.baseTokens(vintage);
		if (BigNumber.from(address).isZero())
			throw new TheaError({ type: "TOKEN_NOT_FOUND", message: `Token by ${vintage} vintage not found` });

		return address;
	}
}
