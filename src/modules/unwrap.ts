import { ProviderOrSigner, IRegistryContract, UnwrapTokenState, RequestId, TheaNetwork } from "../types";
import { consts, ContractWrapper, Events, signerRequired, TheaError, tokenAmountShouldBeTon } from "../utils";
import Registry_ABI from "../abi/Registry_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { ContractReceipt, Event } from "@ethersproject/contracts";
import { approve, checkBalance, executeWithResponse } from "./shared";
import { Signer } from "@ethersproject/abstract-signer";

export class Unwrap extends ContractWrapper<IRegistryContract> {
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		super(providerOrSigner, Registry_ABI, consts[`${network}`].registryContract);
	}

	/**
	 * Stores a request to untokenize the VCC token of type `id`, locks the tokens and emits event. Backend listens to event and process the request.
	 * Tokens are not burnt until backend calls `updateUnwrapRequest` function after processing and validating the transfer to offchain `offchainAccount` was succesful.
	 * @param tokenId id of the VCC token
	 * @param amount amount of tokens to unwrap
	 * @param offchainAccount offchain account to transfer the tokens to
	 * @returns RequestId & ContractReceipt  {@link RequestId}
	 */
	async unwrapToken(
		tokenId: BigNumberish,
		amount: BigNumberish,
		offchainAccount: string
	): Promise<ContractReceipt & RequestId> {
		signerRequired(this.providerOrSigner);
		tokenAmountShouldBeTon(amount);

		await checkBalance(this.providerOrSigner as Signer, this.network, { token: "ERC1155", tokenId, amount });

		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC1155",
			spender: this.contractDetails.address
		});

		return executeWithResponse<RequestId>(
			this.contract.unwrap(tokenId, amount, offchainAccount),
			{
				...this.contractDetails,
				contractFunction: "unwrap"
			},
			this.extractRequestIdFromEvent
		);
	}

	/**
	 * Returns the state of the unwrap token request. It calls the `requests` mapping of the Registry contract.
	 * @param `requestId` id of the request
	 * @returns UnwrapTokenState {@link UnwrapTokenState}
	 */
	async getUnwrapTokenState(requestId: BigNumberish): Promise<UnwrapTokenState> {
		this.requestIdShouldBeGTZero(requestId);
		const { status, maker, tokenId, amount } = await this.contract.requests(requestId);
		return {
			status,
			maker,
			tokenId: tokenId.toString(),
			amount: amount.toString()
		};
	}

	/**
	 * Validates value of `requestId` which needs to be at least 1
	 * @param requestId value to be checked
	 */
	private requestIdShouldBeGTZero(requestId: BigNumberish): void {
		const requestIdBigNumber = BigNumber.from(requestId);
		if (requestIdBigNumber.lte(0)) {
			throw new TheaError({
				type: "INVALID_REQUEST_ID_VALUE",
				message: "Request id should be greater than 0"
			});
		}
	}

	/**
	 * Callback function to extract request ID from the `UnwrapRequested` event
	 * @param events
	 * @returns {@link RequestId}
	 */
	extractRequestIdFromEvent(events?: Event[]): RequestId {
		const response: RequestId = { requestId: undefined };
		if (events) {
			const event = events.find((event) => event.event === Events.unwrap);
			if (event) response.requestId = event.args?.requestId.toString();
		}

		return response;
	}
}
