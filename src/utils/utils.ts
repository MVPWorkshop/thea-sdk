import { Signer } from "@ethersproject/abstract-signer";
import { isAddress } from "@ethersproject/address";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { ProviderOrSigner, TheaERC20Token, TheaNetwork } from "../types";
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

export const getERC20ContractAddress = (token: TheaERC20Token, network: TheaNetwork): string => {
	switch (token) {
		case "SDG":
			return consts[`${network}`].sdgTokenContract;
		case "Vintage":
			return consts[`${network}`].vintageTokenContract;
		case "LINK":
			return consts[`${network}`].linkTokenContract;
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

export const theaNetworkToChainId = (network: TheaNetwork): ChainId => {
	switch (network) {
		case 1:
			return ChainId.MAINNET;
		case 5:
			return ChainId.GÖRLI;
		default:
			return ChainId.POLYGON;
	}
};

export const getToken = (network: TheaNetwork, token: TheaERC20Token): Token => {
	switch (token) {
		case "SDG":
			return new Token(
				theaNetworkToChainId(network),
				consts[`${network}`].sdgTokenContract,
				4,
				"SDG",
				"Thea SDG Token"
			);
		case "Vintage":
			return new Token(
				theaNetworkToChainId(network),
				consts[`${network}`].vintageTokenContract,
				4,
				"VNT",
				"Thea Vintage Token"
			);
		case "LINK":
			return new Token(
				theaNetworkToChainId(network),
				consts[`${network}`].linkTokenContract,
				18,
				"LINK",
				"Chainlink Token"
			);
		case "Rating":
			return new Token(
				theaNetworkToChainId(network),
				consts[`${network}`].ratingTokenContract,
				4,
				"RTG",
				"Thea Rating Token"
			);
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
