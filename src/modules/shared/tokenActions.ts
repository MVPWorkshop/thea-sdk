import { Signer } from "@ethersproject/abstract-signer";
import { BigNumberish } from "@ethersproject/bignumber";
import { TheaERC20Token, TheaNetwork } from "../../types";
import { TheaError, getBaseTokenERC20ContractAddress, getERC20ContractAddress, consts } from "../../utils";
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

export type ApproveBaseTokeneERC20Options = {
	token: "BaseTokeneERC20";
	spender: string;
	amount: BigNumberish;
	id: BigNumberish;
};

export type ApproveOptions = ApproveERC1155Options | ApproveERC20Options | ApproveBaseTokeneERC20Options;

// TODO: Create singletons for TheaERC20 and TheaERC1155
export const approve = async (signer: Signer, network: TheaNetwork, options: ApproveOptions): Promise<void> => {
	const owner = await signer.getAddress();
	switch (options.token) {
		case "BaseTokeneERC20":
			return new TheaERC20(
				signer,
				await getBaseTokenERC20ContractAddress(options.id, signer, consts[`${network}`].baseTokenManagerContract)
			).approveERC20(owner, options.spender, options.amount);
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
export type BalanceOfBaseTokeneERC20Options = {
	token: "BaseTokeneERC20";
	id: BigNumberish;
	amount: BigNumberish;
};

export type BalanceOfOptions = BalanceOfERC1155Options | BalanceOfERC20Options | BalanceOfBaseTokeneERC20Options;

// TODO: Create singletons for TheaERC20 and TheaERC1155
export const checkBalance = async (signer: Signer, network: TheaNetwork, options: BalanceOfOptions): Promise<void> => {
	const owner = await signer.getAddress();

	switch (options.token) {
		case "BaseTokeneERC20":
			return new TheaERC20(
				signer,
				await getBaseTokenERC20ContractAddress(options.id, signer, consts[`${network}`].baseTokenManagerContract)
			).checkERC20Balance(owner, options.amount);
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
