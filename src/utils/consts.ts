import { TheaNetwork } from "src/types";

export const RATE_VCC_TO_BT = 10;
export const TOKEN_LIST_FETCHING_URL = "https://api.rarible.org/v0.1";
export const ORDERBOOK_URL = "https://api.trader.xyz/orderbook";

export enum Events {
	unwrap = "UnwrapRequested",
	convert = "Converted",
	recover = "Recovered"
}

export type EnvConfig = {
	networkName: string;
	registryContract: string;
	theaERC1155Contract: string;
	vintageTokenContract: string;
	sdgTokenContract: string;
	ratingTokenContract: string;
	baseTokenManagerContract: string;
	baseTokenManagerDeployerContract: string;
	theaApiBaseUrl: string;
	stableCoinContract: string;
};

export const consts: { [key in TheaNetwork]: EnvConfig } = {
	[TheaNetwork.GANACHE]: {
		networkName: "GANACHE",
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0x0CFB090683Ea58B740F583c348Ff8730A82f3F64",
		vintageTokenContract: "0x3621027715647B69D706636a8878E85d725A2aed",
		sdgTokenContract: "0xB48C895039c9F81C87eb97Ed54B69a769b291f28",
		ratingTokenContract: "0xc95347BD5212148A09c34a7d890D061D73f50bb8",
		baseTokenManagerContract: "0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76",
		baseTokenManagerDeployerContract: "0x3ace09bba3b8507681146252d3dd33cd4e2d4f63",
		stableCoinContract: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", //DAI
		theaApiBaseUrl: "http://127.0.0.1:8078/cli"
	},
	[TheaNetwork.GOERLI]: {
		networkName: "GOERLI",
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0x0CFB090683Ea58B740F583c348Ff8730A82f3F64",
		vintageTokenContract: "0x3621027715647B69D706636a8878E85d725A2aed",
		sdgTokenContract: "0xB48C895039c9F81C87eb97Ed54B69a769b291f28",
		ratingTokenContract: "0xc95347BD5212148A09c34a7d890D061D73f50bb8",
		baseTokenManagerContract: "0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76",
		baseTokenManagerDeployerContract: "0x3ace09bba3b8507681146252d3dd33cd4e2d4f63",
		stableCoinContract: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", //DAI
		theaApiBaseUrl: "http://127.0.0.1:8078/cli"
	},
	[TheaNetwork.MAINNET]: {
		networkName: "ETHEREUM",
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
		vintageTokenContract: "0x3621027715647B69D706636a8878E85d725A2aed",
		sdgTokenContract: "0xB48C895039c9F81C87eb97Ed54B69a769b291f28",
		ratingTokenContract: "0xc95347BD5212148A09c34a7d890D061D73f50bb8",
		baseTokenManagerContract: "0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76",
		baseTokenManagerDeployerContract: "0x3ace09bba3b8507681146252d3dd33cd4e2d4f63",
		stableCoinContract: "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa", //DAI
		theaApiBaseUrl: "http://127.0.0.1:8078/cli"
	}
};
