import { TheaNetwork } from "src/types";

export const REGISTRY_CONTRACT_ADDRESS = "0xe135783649bfa7c9c4c6f8e528c7f56166efc8a6";
export const THEA_ERC1155_CONTRACT_ADDRESS = "0x2e1f232a9439c3d459fceca0beef13acc8259dd8"; //0x2e1f232a9439c3d459fceca0beef13acc8259dd8
export const VINTAGE_TOKEN_CONTRACT_ADDRESS = "0x686afd6e502a81d2e77f2e038a23c0def4949a20";
export const SDG_TOKEN_CONTRACT_ADDRESS = "0x43d1f9096674b5722d359b6402381816d5b22f28";
export const RATING_TOKEN_CONTRACT_ADDRESS = "0x4261d524bc701da4ac49339e5f8b299977045ea5";
export const BASE_TOKEN_MANAGER_CONTRACT_ADDRESS = "0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76";
export const BASE_TOKEN_MANAGER_DEPLOYER_CONTRACT_ADDRESS = "0x3ace09bba3b8507681146252d3dd33cd4e2d4f63";
export const BASE_TOKEN_MANAGER_DEPLOYER_IMPLEMENTATION_CONTRACT_ADDRESS =
	"0xbec8a9e485a4b75d3b14249de7ca6d124fe947950xbec8a9e485a4b75d3b14249de7ca6d124fe94795";
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
