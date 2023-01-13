import { ProviderOrSigner, IBaseTokenManagerContract, ConvertEvent } from "../types";
import { ContractWrapper, BASE_TOKEN_MANAGER_CONTRACT_ADDRESS, signerRequired, TheaError, Events } from "../utils";
import BaseTokenManager_ABI from "../abi/BaseTokenManager_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { ContractReceipt, Event } from "@ethersproject/contracts";
import { approve, checkBalance, executeWithResponse } from "./shared";
import { Signer } from "@ethersproject/abstract-signer";

export class Convert extends ContractWrapper<IBaseTokenManagerContract> {
	constructor(readonly providerOrSigner: ProviderOrSigner) {
		super(providerOrSigner, BaseTokenManager_ABI, BASE_TOKEN_MANAGER_CONTRACT_ADDRESS);
	}

	/**
	 * Stores a request to convert the VCC NFT token of type `id`, locks the tokens and sends caller BaseTokens based on 'amount' sent and emits event.
	 * @param tokenId id of the VCC token
	 * @param amount amount of tokens to convert
	 * @returns A promise fulfilled with the contract transaction.
	 */
	async convertNFT(tokenId: BigNumberish, amount: BigNumberish): Promise<ContractReceipt> {
		signerRequired(this.providerOrSigner);
		this.amountShouldBeGTZero(amount);

		await checkBalance(this.providerOrSigner as Signer, { token: "ERC1155", tokenId, amount });

		await approve(this.providerOrSigner as Signer, {
			token: "ERC1155",
			spender: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS
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

	/**
	 * Validates value of `amount` is greater than 0
	 * @param amount value to be checked
	 */
	private amountShouldBeGTZero(amount: BigNumberish): void {
		const amountBigNumber = BigNumber.from(amount);
		if (amountBigNumber.lte(0)) {
			throw new TheaError({
				type: "INVALID_TOKEN_AMOUNT_VALUE",
				message: "Amount should be greater than 0"
			});
		}
	}

	extractIdAndAmountFromEvent(events?: Event[]): ConvertEvent {
		const response: ConvertEvent = { id: undefined, amount: undefined };
		if (events) {
			const event = events.find((event) => event.event === Events.convert);
			if (event) {
				response.id = event.args?.id.toString();
				response.amount = event.args?.amount.toString();
			}
		}

		return response;
	}
}
