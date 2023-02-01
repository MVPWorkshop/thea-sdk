import { Signer } from "@ethersproject/abstract-signer";
import { isAddress } from "@ethersproject/address";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { ProviderOrSigner, TheaERC20Token, TheaNetwork } from "../types";
import { consts } from "./consts";
import { TheaError } from "./theaError";
import BaseTokenManager_ABI from "../abi/BaseTokenManager_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

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

/* eslint-disable  @typescript-eslint/no-explicit-any */
export function isTypedDataSigner(providerOrSigner: any): providerOrSigner is Signer {
	return !!providerOrSigner._signTypedData;
}

export const typedDataSignerRequired = (providerOrSigner: ProviderOrSigner) => {
	if (!isTypedDataSigner(providerOrSigner) && !isSigner(providerOrSigner)) {
		throw new TheaError({
			type: "TYPED_DATA_SIGNER_REQUIRED",
			message:
				"TypedDataSigner is required for this operation. You must pass in a TypedDataSigner(Wallet) on SDK initialization"
		});
	}
};

export const getERC20ContractAddress = (token: TheaERC20Token, network: TheaNetwork): string => {
	switch (token) {
		case "SDG":
			return consts[`${network}`].sdgTokenContract;
		case "Vintage":
			return consts[`${network}`].vintageTokenContract;
		case "LINK":
			return consts[`${network}`].linkTokenContract;
		case "Stable":
			return consts[`${network}`].stableTokenContract;
		default:
			return consts[`${network}`].ratingTokenContract;
	}
};

export const getBaseTokenERC20ContractAddress = async (
	id: BigNumberish,
	providerOrSigner: ProviderOrSigner,
	contractAddress: string
): Promise<string> => {
	const basteTokenManagerContract = new Contract(
		contractAddress,
		castAbiInterface(BaseTokenManager_ABI.abi),
		providerOrSigner
	);
	return await basteTokenManagerContract.baseTokens(id);
};

export const amountShouldBeGTZero = (amount: BigNumberish): void => {
	const amountBigNumber = BigNumber.from(amount);
	if (amountBigNumber.lte(0)) {
		throw new TheaError({
			type: "INVALID_TOKEN_AMOUNT_VALUE",
			message: "Amount should be greater than 0"
		});
	}
};
