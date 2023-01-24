import { TheaNetwork } from "src/types";

export const RATE_VCC_TO_BT = 10;

export enum Events {
	unwrap = "UnwrapRequested",
	convert = "Converted",
	recover = "Recovered"
}

export type EnvConfig = {
	registryContract: string;
	theaERC1155Contract: string;
	vintageTokenContract: string;
	sdgTokenContract: string;
	ratingTokenContract: string;
	baseTokenManagerContract: string;
	baseTokenManagerDeployerContract: string;
	stableTokenContract: string;
	quoterContract: string;
	linkTokenContract: string;
	theaApiBaseUrl: string;
};

export const consts: { [key in TheaNetwork]: EnvConfig } = {
	[TheaNetwork.GANACHE]: {
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0x0CFB090683Ea58B740F583c348Ff8730A82f3F64",
		vintageTokenContract: "0x3621027715647B69D706636a8878E85d725A2aed",
		sdgTokenContract: "0xB48C895039c9F81C87eb97Ed54B69a769b291f28",
		ratingTokenContract: "0xc95347BD5212148A09c34a7d890D061D73f50bb8",
		baseTokenManagerContract: "0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76",
		baseTokenManagerDeployerContract: "0x3ace09bba3b8507681146252d3dd33cd4e2d4f63",
		stableTokenContract: "0x6B175474E89094C44Da98b954EedeAC495271d0F", //DAI
		quoterContract: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
		linkTokenContract: "0x514910771AF9Ca656af840dff83E8264EcF986CA", // TODO: Remove this later it's only for testing
		theaApiBaseUrl: "http://127.0.0.1:8078/cli"
	},
	[TheaNetwork.GOERLI]: {
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0x0CFB090683Ea58B740F583c348Ff8730A82f3F64",
		vintageTokenContract: "0x3621027715647B69D706636a8878E85d725A2aed",
		sdgTokenContract: "0xB48C895039c9F81C87eb97Ed54B69a769b291f28",
		ratingTokenContract: "0xc95347BD5212148A09c34a7d890D061D73f50bb8",
		baseTokenManagerContract: "0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76",
		baseTokenManagerDeployerContract: "0x3ace09bba3b8507681146252d3dd33cd4e2d4f63",
		stableTokenContract: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", //DAI
		quoterContract: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
		linkTokenContract: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB", // TODO: Remove this later it's only for testing
		theaApiBaseUrl: "http://127.0.0.1:8078/cli"
	},
	[TheaNetwork.MAINNET]: {
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0x0CFB090683Ea58B740F583c348Ff8730A82f3F64",
		vintageTokenContract: "0x3621027715647B69D706636a8878E85d725A2aed",
		sdgTokenContract: "0xB48C895039c9F81C87eb97Ed54B69a769b291f28",
		ratingTokenContract: "0xc95347BD5212148A09c34a7d890D061D73f50bb8",
		baseTokenManagerContract: "0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76",
		baseTokenManagerDeployerContract: "0x3ace09bba3b8507681146252d3dd33cd4e2d4f63",
		stableTokenContract: "0x6B175474E89094C44Da98b954EedeAC495271d0F", //DAI
		quoterContract: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
		linkTokenContract: "0x514910771AF9Ca656af840dff83E8264EcF986CA", // TODO: Remove this later it's only for testing
		theaApiBaseUrl: "http://127.0.0.1:8078/cli"
	}
};
