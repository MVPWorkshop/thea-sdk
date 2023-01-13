import {
	ProviderOrSigner,
	IBaseTokenManagerContract,
	RecoverEvent,
	BaseTokenCharactaristics,
	BaseTokenAmounts
} from "../types";
import {
	ContractWrapper,
	BASE_TOKEN_MANAGER_CONTRACT_ADDRESS,
	RATE_VCC_TO_BT,
	signerRequired,
	TheaError,
	Events
} from "../utils";
import BaseTokenManager_ABI from "../abi/BaseTokenManager_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Contract, ContractReceipt, Event } from "@ethersproject/contracts";
import { approve, checkBalance, executeWithResponse } from "./shared";
import { Signer } from "@ethersproject/abstract-signer";
import { formatBytes32String } from "@ethersproject/strings";
import { defaultAbiCoder } from "@ethersproject/abi";

export class Recover extends ContractWrapper<IBaseTokenManagerContract> {
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly registry: Contract) {
		super(providerOrSigner, BaseTokenManager_ABI, BASE_TOKEN_MANAGER_CONTRACT_ADDRESS);
		this.registry = registry;
	}

	/**
	 * Stores a request to reccove the VCC NFT token of type `id` from Base Tokens, unlocks the NFT and burns BaseTokens based on 'amount' sent and emits event.
	 * @param tokenId id of the VCC token
	 * @param amount amount of tokens to recover
	 * @returns A promise fulfilled with the contract transaction.
	 */
	async recoverNFT(tokenId: BigNumberish, amount: BigNumberish): Promise<ContractReceipt> {
		signerRequired(this.providerOrSigner);
		this.amountShouldBeGTZero(amount);

		const baseTokenCharactaristics = await this.contract.baseCharacteristics();
		const btAmount = await this.calculateBaseTokensAmounts(tokenId, amount, baseTokenCharactaristics);

		await this.checkBalancesForAllBaseTokens(btAmount, baseTokenCharactaristics);
		await this.approveAllBaseTokens(btAmount, baseTokenCharactaristics);

		return executeWithResponse<RecoverEvent>(
			this.contract.recover(tokenId, amount),
			{
				...this.contractDetails,
				contractFunction: "recover"
			},
			this.extractInfoFromEvent
		);
	}

	async checkBalancesForAllBaseTokens(btAmount: BaseTokenAmounts, baseTokenCharactaristics: BaseTokenCharactaristics) {
		await checkBalance(this.providerOrSigner as Signer, {
			token: "BaseTokeneERC20",
			amount: btAmount.btVintage,
			id: baseTokenCharactaristics.vintage
		});
		await checkBalance(this.providerOrSigner as Signer, { token: "ERC20", amount: btAmount.sdg, tokenName: "SDG" });
		await checkBalance(this.providerOrSigner as Signer, {
			token: "ERC20",
			amount: btAmount.vintage,
			tokenName: "Vintage"
		});
		await checkBalance(this.providerOrSigner as Signer, {
			token: "ERC20",
			amount: btAmount.rating,
			tokenName: "Rating"
		});
	}

	async approveAllBaseTokens(btAmount: BaseTokenAmounts, baseTokenCharactaristics: BaseTokenCharactaristics) {
		await approve(this.providerOrSigner as Signer, {
			token: "BaseTokeneERC20",
			spender: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS,
			amount: btAmount.btVintage,
			id: baseTokenCharactaristics.vintage
		});

		await approve(this.providerOrSigner as Signer, {
			token: "ERC20",
			spender: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS,
			amount: btAmount.sdg,
			tokenName: "SDG"
		});

		await approve(this.providerOrSigner as Signer, {
			token: "ERC20",
			spender: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS,
			amount: btAmount.vintage,
			tokenName: "Vintage"
		});

		await approve(this.providerOrSigner as Signer, {
			token: "ERC20",
			spender: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS,
			amount: btAmount.rating,
			tokenName: "Rating"
		});
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
	//returns object with sdg, vintage and rating amounts
	async calculateBaseTokensAmounts(
		id: BigNumberish,
		amount: BigNumberish,
		baseTokenCharactaristics: BaseTokenCharactaristics
	): Promise<{ btVintage: BigNumber; sdg: BigNumber; vintage: BigNumber; rating: BigNumber }> {
		const unitAmount = BigNumber.from(amount).mul(RATE_VCC_TO_BT);

		const { sdgValue, vintageValue, ratingValue } = await this.getFeatureValue(id);

		const sdgAmount = BigNumber.from(unitAmount).mul(sdgValue.sub(baseTokenCharactaristics.sdgsCount));
		const vintageAmount = BigNumber.from(unitAmount).mul(vintageValue.sub(baseTokenCharactaristics.vintage));
		const ratingAmount = BigNumber.from(unitAmount).mul(ratingValue.sub(baseTokenCharactaristics.rating));

		return { btVintage: unitAmount, sdg: sdgAmount, vintage: vintageAmount, rating: ratingAmount };
	}

	async getFeatureValue(
		id: BigNumberish
	): Promise<{ vintageValue: BigNumber; sdgValue: BigNumber; ratingValue: BigNumber }> {
		const keys = [formatBytes32String("vintage"), formatBytes32String("sdgs_count"), formatBytes32String("rating")];
		const bytes = this.registry.getCharacteristicsBytes(id, keys);
		const values = defaultAbiCoder.decode(["uint256", "uint256", "uint256"], bytes);
		return { vintageValue: values[0], sdgValue: values[1], ratingValue: values[2] };
	}

	extractInfoFromEvent(events?: Event[]): RecoverEvent {
		const response: RecoverEvent = { id: undefined, amount: undefined, msgSender: undefined };
		if (events) {
			const event = events.find((event) => event.event === Events.recover);
			if (event) {
				response.id = event.args?.id.toString();
				response.amount = event.args?.amount.toString();
				response.msgSender = event.args?.msgSender.toString();
			}
		}

		return response;
	}
}
