import { IBaseTokenManagerContract, IRegistryContract, ProviderOrSigner, RequestId, TheaNetwork } from "../types";
import { amountShouldBeGTZero, consts, ContractWrapper, Events, getAddress, signerRequired, TheaError } from "../utils";
import Registry_ABI from "../abi/Registry_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { approve, checkBalance, execute, executeWithResponse, TheaERC20 } from "./shared";
import { Signer } from "@ethersproject/abstract-signer";
import { Contract, ContractReceipt, Event } from "@ethersproject/contracts";
import BaseTokenManager_ABI from "../abi/BaseTokenManager_ABI.json";

export class Offset extends ContractWrapper<IRegistryContract> {
	readonly baseTokenManager: IBaseTokenManagerContract;
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		super(providerOrSigner, Registry_ABI, consts[`${network}`].registryContract);
		this.baseTokenManager = new Contract(
			consts[`${network}`].baseTokenManagerContract,
			BaseTokenManager_ABI.abi,
			providerOrSigner
		) as IBaseTokenManagerContract;
	}

	/**
	 * Burns `amount` of VCC tokens of type `id` and emits event. Backend listens to event and retires the corresponding offchain VCCs
	 * @param tokenId - VCC token id
	 * @param amount - amount of VCC tokens to burn
	 * @returns Transaction receipt
	 */
	async offsetNFT(tokenId: BigNumberish, amount: BigNumberish): Promise<ContractReceipt> {
		signerRequired(this.providerOrSigner);
		amountShouldBeGTZero(amount);
		await checkBalance(this.providerOrSigner as Signer, this.network, { token: "ERC1155", tokenId, amount });

		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC1155",
			spender: this.contractDetails.address
		});

		return execute(this.contract.retire(tokenId, amount), { ...this.contractDetails, contractFunction: "retire" });
	}

	/**
	 * Stores a request to retire with NBT token of `amount`, locks the NBT tokens and emits event.
	 * Backend listens to event and process the request. Tokens are not transferred until backend calls `closeRetireFungible`
	 * function after processing and validating the recovery and retire of VCC is successful.
	 * @param vintage - vintage of NBT token
	 * @param amount - amount of NBT token to retire
	 * @returns RequestId & ContractReceipt  {@link RequestId}
	 */
	async offsetFungible(vintage: number, amount: BigNumberish): Promise<ContractReceipt & RequestId> {
		signerRequired(this.providerOrSigner);
		amountShouldBeGTZero(amount);

		const address = await this.getBaseTokenAddressByVintage(vintage);

		const token = new TheaERC20(this.providerOrSigner, address);
		const owner = await getAddress(this.providerOrSigner as Signer);

		// Check balance
		await token.checkERC20Balance(owner, amount);

		// Approve
		await token.approveERC20(owner, this.contractDetails.address, amount);

		return executeWithResponse<RequestId>(
			this.contract.requestRetireFungible(vintage, amount),
			{
				...this.contractDetails,
				contractFunction: "requestRetireFungible"
			},
			this.extractRequestIdFromEvent
		);
	}

	/**
	 * Callback function to extract request ID from the `UnwrapRequested` event
	 * @param events
	 * @returns {@link RequestId}
	 */
	extractRequestIdFromEvent(events?: Event[]): RequestId {
		const response: RequestId = { requestId: undefined };
		if (events) {
			const event = events.find((event) => event.event === Events.retireOffset);
			if (event) response.requestId = event.args?.requestId.toString();
		}

		return response;
	}

	private async getBaseTokenAddressByVintage(vintage: number): Promise<string> {
		const address = await this.baseTokenManager.baseTokens(vintage);
		if (BigNumber.from(address).isZero())
			throw new TheaError({ type: "TOKEN_NOT_FOUND", message: `Token by ${vintage} vintage not found` });

		return address;
	}
}
