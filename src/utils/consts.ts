import { BigNumber } from "@ethersproject/bignumber";
import { TheaNetwork } from "src/types";

export const RATE_VCC_TO_BT = 10;
export const STABLE_TOKEN_DECIMALS_MULTIPLIER = 10 ** 18;
export const ORDERBOOK_URL = "https://api.trader.xyz/orderbook";
export const DEFAULT_SLIPPAGE_TOLERANCE = 0.5;
export const INFINITE_EXPIRATION_TIMESTAMP_SEC = BigNumber.from(2524604400);
export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export const RESERVED_APP_ID_PREFIX = "1001";

// Some arbitrarily high number.
export const MAX_APPROVAL = BigNumber.from(2).pow(118);
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
	recover = "Recovered",
	rollTokens = "Rolled"
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
	swapRouterContract: string;
	theaApiBaseUrl: string;
	exchangeProxyAddress: string;
	subGraphUrl: string;
};

export const consts: { [key in TheaNetwork]: EnvConfig } = {
	[TheaNetwork.GANACHE]: {
		networkName: "GANACHE",
		registryContract: "0xe135783649BfA7c9c4c6F8E528C7f56166efC8a6",
		theaERC1155Contract: "0x2E1f232a9439C3D459FcEca0BeEf13acc8259Dd8",
		vintageTokenContract: "0x686AfD6e502A81D2e77f2e038A23C0dEf4949A20",
		sdgTokenContract: "0x43D1F9096674B5722D359B6402381816d5B22F28",
		ratingTokenContract: "0x4261D524bc701dA4AC49339e5F8b299977045eA5",
		currentNbtTokenContract: "", // Call setCurrentNBTContractAddress to set address at init/thea.ts
		baseTokenManagerContract: "0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76",
		baseTokenManagerDeployerContract: "0x3ace09bba3b8507681146252d3dd33cd4e2d4f63",
		stableTokenContract: "0x6B175474E89094C44Da98b954EedeAC495271d0F", //DAI
		quoterContract: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
		swapRouterContract: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
		theaApiBaseUrl: "https://127.0.0.1:8078/cli",
		exchangeProxyAddress: "0xf91bb752490473b8342a3e964e855b9f9a2a668e",
		subGraphUrl: "http://localhost:8000/subgraphs/name/thea-protocol/thea-subgraph"
	},
	[TheaNetwork.MUMBAI]: {
		networkName: "MUMBAI",
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0xf37221F42678AcE417f2bc5c89489d1f0C77C133", // dummy erc1155
		vintageTokenContract: "0x724176146cd1fC5873480E4F2f53184B6734cbD9",
		sdgTokenContract: "0x4e5C34027912d6945B2C5CfE3A4E6CA16d50a482",
		ratingTokenContract: "0x007d5Af3e0AC91F3aEd13B866Ba05A0E4DBf8421",
		currentNbtTokenContract: "",
		baseTokenManagerContract: "0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76",
		baseTokenManagerDeployerContract: "0x3ace09bba3b8507681146252d3dd33cd4e2d4f63",
		stableTokenContract: "0x014349F1C543038a76384cFC1A68f1881AFc6B0a", // Dummy USDC
		quoterContract: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
		swapRouterContract: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
		theaApiBaseUrl: "https://127.0.0.1:8078/cli",
		exchangeProxyAddress: "0x4fb72262344034e034fce3d9c701fd9213a55260",
		subGraphUrl: "http://localhost:8000/subgraphs/name/thea-protocol/thea-subgraph"
	},
	[TheaNetwork.POLYGON]: {
		networkName: "POLYGON",
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0x22d5f9B75c524Fec1D6619787e582644CD4D7422", // sunflower
		vintageTokenContract: "0x3621027715647B69D706636a8878E85d725A2aed",
		sdgTokenContract: "0xB48C895039c9F81C87eb97Ed54B69a769b291f28",
		ratingTokenContract: "0xc95347BD5212148A09c34a7d890D061D73f50bb8",
		currentNbtTokenContract: "",
		baseTokenManagerContract: "0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76",
		baseTokenManagerDeployerContract: "0x3ace09bba3b8507681146252d3dd33cd4e2d4f63",
		stableTokenContract: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
		quoterContract: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
		swapRouterContract: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
		theaApiBaseUrl: "https://127.0.0.1:8078/cli",
		exchangeProxyAddress: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
		subGraphUrl: "http://localhost:8000/subgraphs/name/thea-protocol/thea-subgraph"
	}
};

export type ISO_CODES =
	| "AFG"
	| "ALA"
	| "ALB"
	| "DZA"
	| "ASM"
	| "AND"
	| "AGO"
	| "AIA"
	| "ATA"
	| "ATG"
	| "ARG"
	| "ARM"
	| "ABW"
	| "AUS"
	| "AUT"
	| "AZE"
	| "BHS"
	| "BHR"
	| "BGD"
	| "BRB"
	| "BLR"
	| "BEL"
	| "BLZ"
	| "BEN"
	| "BMU"
	| "BTN"
	| "BOL"
	| "BES"
	| "BIH"
	| "BWA"
	| "BRA"
	| "VGB"
	| "BRN"
	| "BGR"
	| "BFA"
	| "BDI"
	| "KHM"
	| "CMR"
	| "CAN"
	| "CPV"
	| "CAF"
	| "TCD"
	| "CHL"
	| "CHN"
	| "CXR"
	| "COL"
	| "COM"
	| "COG"
	| "COK"
	| "CRI"
	| "CIV"
	| "HRV"
	| "CUB"
	| "CUW"
	| "CYP"
	| "CZE"
	| "COD"
	| "DNK"
	| "DJI"
	| "DMA"
	| "DOM"
	| "ECU"
	| "EGY"
	| "SLV"
	| "GNQ"
	| "ERI"
	| "EST"
	| "SWZ"
	| "ETH"
	| "FRO"
	| "FLK"
	| "FJI"
	| "FIN"
	| "FRA"
	| "GUF"
	| "PYF"
	| "GAB"
	| "GMB"
	| "GEO"
	| "DEU"
	| "GHA"
	| "GRC"
	| "GRL"
	| "GRD"
	| "GLP"
	| "GTM"
	| "GGY"
	| "GIN"
	| "GNB"
	| "GUY"
	| "HTI"
	| "HND"
	| "HKG"
	| "HUN"
	| "ISL"
	| "IND"
	| "IDN"
	| "IRN"
	| "IRQ"
	| "IRL"
	| "IMN"
	| "ISR"
	| "ITA"
	| "JAM"
	| "JPN"
	| "JEY"
	| "JOR"
	| "KAZ"
	| "KEN"
	| "KIR"
	| "KWT"
	| "KGZ"
	| "LAO"
	| "LVA"
	| "LBN"
	| "LSO"
	| "LBR"
	| "LBY"
	| "LIE"
	| "LTU"
	| "LUX"
	| "MAC"
	| "MDG"
	| "MWI"
	| "MYS"
	| "MDV"
	| "MLI"
	| "MLT"
	| "MHL"
	| "MTQ"
	| "MRT"
	| "MUS"
	| "MYT"
	| "MEX"
	| "FSM"
	| "MDA"
	| "MNG"
	| "MNE"
	| "MSR"
	| "MAR"
	| "MOZ"
	| "MMR"
	| "NAM"
	| "NRU"
	| "NPL"
	| "NLD"
	| "ANT"
	| "NCL"
	| "NZL"
	| "NIC"
	| "NER"
	| "NGA"
	| "NIU"
	| "PRK"
	| "MKD"
	| "NOR"
	| "OMN"
	| "PAK"
	| "PLW"
	| "PSE"
	| "PAN"
	| "PNG"
	| "PRY"
	| "PER"
	| "PHL"
	| "POL"
	| "PRT"
	| "PRI"
	| "QAT"
	| "REU"
	| "ROU"
	| "RUS"
	| "RWA"
	| "SHN"
	| "KNA"
	| "LCA"
	| "MAF"
	| "SPM"
	| "VCT"
	| "WSM"
	| "STP"
	| "SAU"
	| "SEN"
	| "SRB"
	| "SYC"
	| "SLE"
	| "SGP"
	| "SXM"
	| "SVK"
	| "SVN"
	| "SLB"
	| "SOM"
	| "ZAF"
	| "KOR"
	| "SSD"
	| "ESP"
	| "LKA"
	| "SDN"
	| "SUR"
	| "SJM"
	| "SWE"
	| "CHE"
	| "SYR"
	| "TWN"
	| "TJK"
	| "TZA"
	| "THA"
	| "TLS"
	| "TGO"
	| "TON"
	| "TTO"
	| "TUN"
	| "TUR"
	| "TKM"
	| "TCA"
	| "TUV"
	| "UGA"
	| "UKR"
	| "ARE"
	| "GBR"
	| "USA"
	| "VIR"
	| "URY"
	| "UZB"
	| "VUT"
	| "VEN"
	| "VNM"
	| "WLF"
	| "ESH"
	| "YEM"
	| "ZMB"
	| "ZWE";
