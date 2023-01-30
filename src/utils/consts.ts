import { TheaNetwork } from "../types";
import { BigNumber } from "@ethersproject/bignumber";

export const RATE_VCC_TO_BT = 10;
export const STABLE_TOKEN_DECIMALS_MULTIPLIER = 10 ** 18;
export const TOKEN_LIST_FETCHING_URL = "https://api.rarible.org/v0.1";
export const ORDERBOOK_URL = "https://api.trader.xyz/orderbook";
export const INFINITE_EXPIRATION_TIMESTAMP_SEC = BigNumber.from(2524604400);
export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export const RESERVED_APP_ID_PREFIX = "1001";
// Number of digits in base 10 128bit nonce
// floor(log_10(2^128 - 1)) + 1
export const ONE_TWENTY_EIGHT_BIT_LENGTH = 39;
// Max nonce digit length in base 10
// floor(log_10(2^256 - 1)) + 1
export const TWO_FIFTY_SIX_BIT_LENGTH = 78;

export const ERC1155ORDER_STRUCT_NAME = "ERC1155Order";
export const ERC1155ORDER_STRUCT_ABI = [
	{ type: "uint8", name: "direction" },
	{ type: "address", name: "maker" },
	{ type: "address", name: "taker" },
	{ type: "uint256", name: "expiry" },
	{ type: "uint256", name: "nonce" },
	{ type: "address", name: "erc20Token" },
	{ type: "uint256", name: "erc20TokenAmount" },
	{ type: "Fee[]", name: "fees" },
	{ type: "address", name: "erc1155Token" },
	{ type: "uint256", name: "erc1155TokenId" },
	{ type: "Property[]", name: "erc1155TokenProperties" },
	{ type: "uint128", name: "erc1155TokenAmount" }
];

export const DEFAULT_APP_ID = "33271337";
export const FEE_ABI = [
	{ type: "address", name: "recipient" },
	{ type: "uint256", name: "amount" },
	{ type: "bytes", name: "feeData" }
];

export const PROPERTY_ABI = [
	{ type: "address", name: "propertyValidator" },
	{ type: "bytes", name: "propertyData" }
];
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
	currentNbtTokenContract: string;
	baseTokenManagerContract: string;
	baseTokenManagerDeployerContract: string;
	stableTokenContract: string;
	quoterContract: string;
	linkTokenContract: string;
	theaApiBaseUrl: string;
	swapRouterContract: string;
	exchangeProxyAddress: string;
};

export const consts: { [key in TheaNetwork]: EnvConfig } = {
	[TheaNetwork.GOERLI]: {
		networkName: "GOERLI",
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0x0CFB090683Ea58B740F583c348Ff8730A82f3F64",
		vintageTokenContract: "0x3621027715647B69D706636a8878E85d725A2aed",
		sdgTokenContract: "0xB48C895039c9F81C87eb97Ed54B69a769b291f28",
		ratingTokenContract: "0xc95347BD5212148A09c34a7d890D061D73f50bb8",
		currentNbtTokenContract: "", // Added at SDK initialization
		baseTokenManagerContract: "0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76",
		baseTokenManagerDeployerContract: "0x3ace09bba3b8507681146252d3dd33cd4e2d4f63",
		stableTokenContract: "0x6B175474E89094C44Da98b954EedeAC495271d0F", //DAI
		quoterContract: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
		linkTokenContract: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB", // TODO: Remove this later it's only for testing
		theaApiBaseUrl: "http://127.0.0.1:8078/cli",
		swapRouterContract: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
		exchangeProxyAddress: "0xf91bb752490473b8342a3e964e855b9f9a2a668e"
	},
	[TheaNetwork.MUMBAI]: {
		networkName: "MUMBAI",
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0x2953399124F0cBB46d2CbACD8A89cF0599974963",
		vintageTokenContract: "0x3621027715647B69D706636a8878E85d725A2aed",
		sdgTokenContract: "0xB48C895039c9F81C87eb97Ed54B69a769b291f28",
		ratingTokenContract: "0xc95347BD5212148A09c34a7d890D061D73f50bb8",
		currentNbtTokenContract: "",
		baseTokenManagerContract: "0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76",
		baseTokenManagerDeployerContract: "0x3ace09bba3b8507681146252d3dd33cd4e2d4f63",
		stableTokenContract: "0xd393b1E02dA9831Ff419e22eA105aAe4c47E1253", // Native Mumbai Matic
		quoterContract: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
		linkTokenContract: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB", // TODO: Remove this later it's only for testing
		theaApiBaseUrl: "http://127.0.0.1:8078/cli",
		swapRouterContract: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
		exchangeProxyAddress: "0x4fb72262344034e034fce3d9c701fd9213a55260"
	},
	[TheaNetwork.POLYGON]: {
		networkName: "POLYGON",
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
		vintageTokenContract: "0x3621027715647B69D706636a8878E85d725A2aed",
		sdgTokenContract: "0xB48C895039c9F81C87eb97Ed54B69a769b291f28",
		ratingTokenContract: "0xc95347BD5212148A09c34a7d890D061D73f50bb8",
		currentNbtTokenContract: "",
		baseTokenManagerContract: "0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76",
		baseTokenManagerDeployerContract: "0x3ace09bba3b8507681146252d3dd33cd4e2d4f63",
		stableTokenContract: "0x6B175474E89094C44Da98b954EedeAC495271d0F", //DAI
		quoterContract: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
		linkTokenContract: "0x514910771AF9Ca656af840dff83E8264EcF986CA", // TODO: Remove this later it's only for testing
		theaApiBaseUrl: "http://127.0.0.1:8078/cli",
		swapRouterContract: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
		exchangeProxyAddress: "0xdef1c0ded9bec7f1a1670819833240f027b25eff"
	}
};
