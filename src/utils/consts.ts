import { TheaNetwork } from "../types";

export const REGISTRY_CONTRACT_ADDRESS = "0x88449Dd0a1b75BC607A1E971b13930617D535EC1";
export const THEA_ERC1155_CONTRACT_ADDRESS = "0x0CFB090683Ea58B740F583c348Ff8730A82f3F64";
export const VINTAGE_TOKEN_CONTRACT_ADDRESS = "0x3621027715647B69D706636a8878E85d725A2aed";
export const SDG_TOKEN_CONTRACT_ADDRESS = "0xB48C895039c9F81C87eb97Ed54B69a769b291f28";
export const RATING_TOKEN_CONTRACT_ADDRESS = "0xc95347BD5212148A09c34a7d890D061D73f50bb8";

export enum Events {
	unwrap = "UnwrapRequested"
}

export type EnvConfig = {
	registryContract: string;
	theaERC1155Contract: string;
	vintageTokenContract: string;
	sdgTokenContract: string;
	ratingTokenContract: string;
	theaApiBaseUrl: string;
};

export const consts: { [key in TheaNetwork]: EnvConfig } = {
	[TheaNetwork.GANACHE]: {
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0x0CFB090683Ea58B740F583c348Ff8730A82f3F64",
		vintageTokenContract: "0x3621027715647B69D706636a8878E85d725A2aed",
		sdgTokenContract: "0xB48C895039c9F81C87eb97Ed54B69a769b291f28",
		ratingTokenContract: "0xc95347BD5212148A09c34a7d890D061D73f50bb8",
		theaApiBaseUrl: "http://127.0.0.1:8079"
	},
	[TheaNetwork.GOERLI]: {
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0x0CFB090683Ea58B740F583c348Ff8730A82f3F64",
		vintageTokenContract: "0x3621027715647B69D706636a8878E85d725A2aed",
		sdgTokenContract: "0xB48C895039c9F81C87eb97Ed54B69a769b291f28",
		ratingTokenContract: "0xc95347BD5212148A09c34a7d890D061D73f50bb8",
		theaApiBaseUrl: "http://127.0.0.1:8079"
	},
	[TheaNetwork.MAINNET]: {
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0x0CFB090683Ea58B740F583c348Ff8730A82f3F64",
		vintageTokenContract: "0x3621027715647B69D706636a8878E85d725A2aed",
		sdgTokenContract: "0xB48C895039c9F81C87eb97Ed54B69a769b291f28",
		ratingTokenContract: "0xc95347BD5212148A09c34a7d890D061D73f50bb8",
		theaApiBaseUrl: "http://127.0.0.1:8079"
	}
};
