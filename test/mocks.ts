import { TokenizationSource, TokenizationState, TokenizationStatus } from "../src";

export const PRIVATE_KEY = "5b5354654516fb598d5c51594e0b50c8f1e1fac0b27424b6251b3e6fd96f4207";
export const WALLET_ADDRESS = "0xE63CCe5bEBF27CFa751de8A1550692d3B12b7B7a";
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const ABI = [
	{
		inputs: [],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		inputs: [],
		name: "greet",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	}
];

export const tokenizationState: TokenizationState = {
	result: {
		uuid: "00000185b7153c46c4dca62b4ebcd490",
		createdAt: "2023-01-15T20:18:20.358Z",
		updatedAt: "2023-01-15T20:18:20.358Z",
		email: "miloscovilons@gmail.com",
		fullName: "Milos Covilo",
		ethAddr: "0xbd44572e53343a0f003b719cf438c6338bd29d9c",
		source: TokenizationSource.VERRA,
		subaccountId: "12274",
		batchId: "11158-289118799-289118805-VCS-VCU-263-VER-KH-14-1748-01012019-31122019-1",
		status: TokenizationStatus.IN_QUEUE,
		specInfo: null,
		statusMess: null,
		transferId: null,
		signProcId: null,
		signDocPdf: null,
		signCertPdf: null
	},
	error: null,
	errorMessage: null
};
