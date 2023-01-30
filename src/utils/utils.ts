import { Signer } from "@ethersproject/abstract-signer";
import { isAddress } from "@ethersproject/address";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { IBaseTokenManagerContract, ProviderOrSigner, TheaERC20Token, TheaNetwork } from "../types";
import { consts } from "./consts";
import { TheaError } from "./theaError";
import BaseTokenManager_ABI from "../abi/BaseTokenManager_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { ChainId } from "@uniswap/smart-order-router";
import { Token } from "@uniswap/sdk-core";
import { parseEther } from "@ethersproject/units";

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

// TODO: Remove LINK after testing
// TODO: Check is DAI stable coin
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
		case "CurrentNBT":
			return consts[`${network}`].currentNbtTokenContract;
		default:
			return consts[`${network}`].ratingTokenContract;
	}
};

export const getCurrentNBTTokenAddress = async (network: TheaNetwork, providerOrSigner: ProviderOrSigner) => {
	const baseTokenManagerContract = new Contract(
		consts[`${network}`].baseTokenManagerContract,
		castAbiInterface(BaseTokenManager_ABI.abi),
		providerOrSigner
	) as IBaseTokenManagerContract;
	const { vintage } = await baseTokenManagerContract.baseCharacteristics();
	return baseTokenManagerContract.baseTokens(vintage);
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

export const theaNetworkToChainId = (network: TheaNetwork): ChainId => {
	switch (network) {
		case 5:
			return ChainId.GÖRLI;
		case 80001:
			return ChainId.POLYGON_MUMBAI;
		default:
			return ChainId.POLYGON;
	}
};

// TODO: Remove LINK after testing
// TODO: Check is DAI stable coin
export const getToken = (network: TheaNetwork, token: TheaERC20Token): Token => {
	const networkId = theaNetworkToChainId(network);
	switch (token) {
		case "SDG":
			return new Token(networkId, consts[`${network}`].sdgTokenContract, 4, "SDG", "Thea SDG Token");
		case "Vintage":
			return new Token(networkId, consts[`${network}`].vintageTokenContract, 4, "VNT", "Thea Vintage Token");
		case "LINK":
			return new Token(networkId, consts[`${network}`].linkTokenContract, 18, "LINK", "Chainlink Token");
		case "Rating":
			return new Token(networkId, consts[`${network}`].ratingTokenContract, 4, "RTG", "Thea Rating Token");
		case "CurrentNBT":
			return new Token(networkId, consts[`${network}`].currentNbtTokenContract, 4, "NBT", "Thea Current NBT");
		default:
			return new Token(
				theaNetworkToChainId(network),
				consts[`${network}`].stableTokenContract,
				18,
				"DAI",
				"Dai Stablecoin"
			);
	}
};

export const ethToWei = (amount: string): string => parseEther(amount).toString();
