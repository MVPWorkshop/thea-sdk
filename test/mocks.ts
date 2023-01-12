import { ContractReceipt } from "@ethersproject/contracts";

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

export const transaction = (contractAddress: string): Partial<ContractReceipt> => ({
	to: contractAddress,
	from: "0x123",
	contractAddress
});
