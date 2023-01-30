import { Signer } from "@ethersproject/abstract-signer";
import { BigNumberish } from "@ethersproject/bignumber";
import { TheaERC20Token, TheaNetwork } from "../../types";
import { TheaError, getERC20ContractAddress } from "../../utils";
import { TheaERC1155 } from "./theaERC1155";
import { TheaERC20 } from "./theaERC20";

export type ApproveERC1155Options = {
	token: "ERC1155";
	spender: string;
};

export type ApproveERC20Options = {
	token: "ERC20";
	spender: string;
	amount: BigNumberish;
	tokenName: TheaERC20Token;
};

export type ApproveOptions = ApproveERC1155Options | ApproveERC20Options;

// TODO: Create singletons for TheaERC20 and TheaERC1155
export const approve = async (signer: Signer, network: TheaNetwork, options: ApproveOptions): Promise<void> => {
	const owner = await signer.getAddress();
	switch (options.token) {
		case "ERC20":
			return new TheaERC20(signer, getERC20ContractAddress(options.tokenName, network)).approveERC20(
				owner,
				options.spender,
				options.amount
			);
		case "ERC1155":
			return new TheaERC1155(signer, network).approveERC1155(owner, options.spender);
		default:
			throw new TheaError({ type: "NOT_SUPPORED_TOKEN_TYPE", message: "Token type does not exist" });
	}
};

export type BalanceOfERC1155Options = {
	token: "ERC1155";
	amount: BigNumberish;
	tokenId: BigNumberish;
};
export type BalanceOfERC20Options = {
	token: "ERC20";
	tokenName: TheaERC20Token;
	amount: BigNumberish;
};

export type BalanceOfOptions = BalanceOfERC1155Options | BalanceOfERC20Options;

// TODO: Create singletons for TheaERC20 and TheaERC1155
export const checkBalance = async (signer: Signer, network: TheaNetwork, options: BalanceOfOptions): Promise<void> => {
	const owner = await signer.getAddress();

	switch (options.token) {
		case "ERC20":
			return new TheaERC20(signer, getERC20ContractAddress(options.tokenName, network)).checkERC20Balance(
				owner,
				options.amount
			);
		case "ERC1155":
			return new TheaERC1155(signer, network).checkERC1155Balance(owner, options.tokenId, options.amount);
		default:
			throw new TheaError({ type: "NOT_SUPPORED_TOKEN_TYPE", message: "Token type does not exist" });
	}
};
