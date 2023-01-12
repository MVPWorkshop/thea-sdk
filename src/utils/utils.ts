import { Signer } from "@ethersproject/abstract-signer";
import { isAddress } from "@ethersproject/address";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { ContractInterface } from "@ethersproject/contracts";
import { ProviderOrSigner, TheaERC20Token } from "../types";
import { RATING_TOKEN_CONTRACT_ADDRESS, SDG_TOKEN_CONTRACT_ADDRESS, VINTAGE_TOKEN_CONTRACT_ADDRESS } from "./consts";
import { TheaError } from "./theaError";

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const castAbiInterface = (abi: any) => {
	return abi as ContractInterface;
};

export const validateAddress = (address: string) => {
	if (isAddress(address) === false) {
		throw new TheaError({
			type: "INVALID_ADDRESS",
			message: "Passed address is not valid ethereum address"
		});
	}

	return address.toLowerCase();
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
export function isSigner(providerOrSigner: any): providerOrSigner is Signer {
	return !!providerOrSigner.signMessage;
}

export const signerRequired = (providerOrSigner: ProviderOrSigner) => {
	if (!isSigner(providerOrSigner)) {
		throw new TheaError({
			type: "SIGNER_REQUIRED",
			message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
		});
	}
};

export const getERC20ContractAddress = (token: TheaERC20Token): string => {
	switch (token) {
		case "SDG":
			return SDG_TOKEN_CONTRACT_ADDRESS;
		case "Vintage":
			return VINTAGE_TOKEN_CONTRACT_ADDRESS;
		default:
			return RATING_TOKEN_CONTRACT_ADDRESS;
	}
};

/**
 * Token amount check. Value should be in ton format
 * @param amount amount to be checked
 */
export const tokenAmountShouldBeTon = (amount: BigNumberish): void => {
	const amountBigNumber = BigNumber.from(amount);
	if (amountBigNumber.lte(0) || amountBigNumber.mod(1000).toNumber() !== 0) {
		throw new TheaError({
			type: "INVALID_TOKEN_AMOUNT_VALUE",
			message: "Amount should be a ton. Value must be greater than 0 and divisible by 1000"
		});
	}
};
