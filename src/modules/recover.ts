import {
	ProviderOrSigner,
	IBaseTokenManagerContract,
	RecoverEvent,
	BaseTokenCharactaristics,
	BaseTokenAmounts,
	TheaNetwork
} from "../types";
import { ContractWrapper, RATE_VCC_TO_BT, signerRequired, Events, consts, amountShouldBeGTZero } from "../utils";
import BaseTokenManager_ABI from "../abi/BaseTokenManager_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { ContractReceipt, Event } from "@ethersproject/contracts";
import { approve, checkBalance, executeWithResponse } from "./shared";
import { Signer } from "@ethersproject/abstract-signer";
import { formatBytes32String } from "@ethersproject/strings";
import { defaultAbiCoder } from "@ethersproject/abi";
import { GetCharacteristicsBytes } from "./getCharacteristicsBytes";

export class Recover extends ContractWrapper<IBaseTokenManagerContract> {
	constructor(
		readonly providerOrSigner: ProviderOrSigner,
		readonly network: TheaNetwork,
		readonly registry: GetCharacteristicsBytes
	) {
		super(providerOrSigner, BaseTokenManager_ABI, consts[`${network}`].baseTokenManagerContract);
		this.registry = registry;
	}

	/**
	 * Stores a request to reccove the VCC NFT token of type `id` from Base Tokens, unlocks the NFT and burns BaseTokens based on 'amount' sent and emits event.
	 * @param tokenId id of the VCC token
	 * @param amount amount of tokens to recover
	 * @returns A promise fulfilled with the contract transaction.
	 */
	async recoverNFT(tokenId: BigNumberish, amount: BigNumberish): Promise<ContractReceipt & RecoverEvent> {
		signerRequired(this.providerOrSigner);
		amountShouldBeGTZero(amount);

		const baseTokenCharactaristics = await this.contract.baseCharacteristics();
		const btAmount = await this.calculateBaseTokensAmounts(tokenId, amount, baseTokenCharactaristics);

		await this.checkBalancesForAllBaseTokens(btAmount);
		await this.approveAllBaseTokens(btAmount);

		return executeWithResponse<RecoverEvent>(
			this.contract.recover(tokenId, amount),
			{
				...this.contractDetails,
				contractFunction: "recover"
			},
			this.extractInfoFromEvent
		);
	}

	async queryRecoverFungibles(tokenId: BigNumberish, amount: BigNumberish): Promise<BaseTokenAmounts> {
		const baseTokenCharactaristics = await this.contract.baseCharacteristics();
		const btAmount = await this.calculateBaseTokensAmounts(tokenId, amount, baseTokenCharactaristics);
		return {
			cbt: btAmount.cbt.toString(),
			sdg: btAmount.sdg.toString(),
			vintage: btAmount.vintage.toString(),
			rating: btAmount.rating.toString()
		};
	}

	async checkBalancesForAllBaseTokens(btAmount: BaseTokenAmounts) {
		await checkBalance(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			amount: btAmount.cbt,
			tokenName: "CurrentNBT"
		});
		await checkBalance(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			amount: btAmount.sdg,
			tokenName: "SDG"
		});
		await checkBalance(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			amount: btAmount.vintage,
			tokenName: "Vintage"
		});
		await checkBalance(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			amount: btAmount.rating,
			tokenName: "Rating"
		});
	}

	async approveAllBaseTokens(btAmount: BaseTokenAmounts) {
		const spender = this.contractDetails.address;
		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			spender,
			amount: btAmount.cbt,
			tokenName: "CurrentNBT"
		});

		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			spender,
			amount: btAmount.sdg,
			tokenName: "SDG"
		});

		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			spender,
			amount: btAmount.vintage,
			tokenName: "Vintage"
		});

		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			spender,
			amount: btAmount.rating,
			tokenName: "Rating"
		});
	}

	//returns object with sdg, vintage and rating amounts
	async calculateBaseTokensAmounts(
		id: BigNumberish,
		amount: BigNumberish,
		baseTokenCharactaristics: BaseTokenCharactaristics
	): Promise<{ cbt: BigNumber; sdg: BigNumber; vintage: BigNumber; rating: BigNumber }> {
		const unitAmount = BigNumber.from(amount).mul(RATE_VCC_TO_BT);
		const { sdgValue, vintageValue, ratingValue } = await this.getFeatureValue(id);

		const sdgAmount = BigNumber.from(unitAmount).mul(sdgValue.sub(baseTokenCharactaristics.sdgsCount));
		const vintageAmount = BigNumber.from(unitAmount).mul(vintageValue.sub(baseTokenCharactaristics.vintage));
		const ratingAmount = BigNumber.from(unitAmount).mul(ratingValue.sub(baseTokenCharactaristics.rating));

		return { cbt: unitAmount, sdg: sdgAmount, vintage: vintageAmount, rating: ratingAmount };
	}

	async getFeatureValue(
		id: BigNumberish
	): Promise<{ vintageValue: BigNumber; sdgValue: BigNumber; ratingValue: BigNumber }> {
		const keys = [formatBytes32String("vintage"), formatBytes32String("sdgs_count"), formatBytes32String("rating")];
		const bytes = await this.registry.getCharacteristicsBytes(id, keys);
		const values = defaultAbiCoder.decode(["uint256", "uint256", "uint256"], bytes);
		return { vintageValue: values[0], sdgValue: values[1], ratingValue: values[2] };
	}

	extractInfoFromEvent(events?: Event[]): RecoverEvent {
		const response: RecoverEvent = { id: undefined, amount: undefined };
		if (events) {
			const event = events.find((event) => event.event === Events.recover);
			if (event) {
				response.id = event.args?.tokenId.toString();
				response.amount = event.args?.amount.toString();
			}
		}

		return response;
	}
}
