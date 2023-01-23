import {
	SearchOrdersResponsePayload,
	TokenizationSource,
	TokenizationState,
	TokenizationStatus,
	TokenListResponsePayload
} from "../src";

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
export const itemsByCollection: TokenListResponsePayload = {
	continuation: "1669946173376_ETHEREUM:0xd07dc4262bcdbf85190c01c996b4c06a461d2430:654210",
	items: [
		{
			id: "ETHEREUM:0xd07dc4262bcdbf85190c01c996b4c06a461d2430:463956",
			blockchain: "ETHEREUM",
			collection: "ETHEREUM:0xd07dc4262bcdbf85190c01c996b4c06a461d2430",
			contract: "ETHEREUM:0xd07dc4262bcdbf85190c01c996b4c06a461d2430",
			tokenId: "463956",
			creators: [{ account: "ETHEREUM:0x6f87176de6060e004f0181bd913cd22b9428fd94", value: 10000 }],
			lazySupply: "0",
			pending: [],
			mintedAt: "2021-04-10T15:17:56Z",
			lastUpdatedAt: "2023-01-15T16:02:53.453Z",
			supply: "0",
			meta: {
				name: "Freestyle",
				description: "Freestyle - Digital Graffiti",
				tags: [],
				genres: [],
				attributes: [{ key: "Laruad", value: "Laruad" }],
				content: [
					{
						"@type": "IMAGE",
						url: "https://ipfs.io/ipfs/QmdThej2WVTPdKWapfgmQYWZZuFRRz4fqK2BFHHRhT5Qvh/image.jpeg",
						representation: "ORIGINAL",
						mimeType: "image/jpeg",
						size: 157565,
						width: 650,
						height: 460
					}
				],
				restrictions: []
			},
			deleted: true,
			originOrders: [],
			ammOrders: { ids: [] },
			auctions: [],
			totalStock: "0",
			sellers: 0,
			suspicious: false
		}
	]
};

export const priceListingMock: SearchOrdersResponsePayload = {
	orders: [
		{
			erc20Token: "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
			erc20TokenAmount: "10000000000000000000",
			nftToken: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
			nftTokenId: "69",
			nftTokenAmount: "100",
			nftType: "ERC721",
			sellOrBuyNft: "buy",
			chainId: "1337",
			order: {
				direction: 1,
				erc20Token: "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
				erc20TokenAmount: "10000000000000000000",
				erc1155Token: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
				erc1155TokenId: "69",
				erc1155TokenAmount: "100",
				erc1155TokenProperties: [],
				expiry: "2524604400",
				fees: [],
				maker: "0x9342a65736a2e9c6a84a2adaba55ad1dc1f3a418",
				nonce: "100131415900000000000000000000000000000096685863241593142117280893798097702934",
				signature: {
					r: "0x39728a3bef397db69c6c6e1409ae6756c567a989894ad0787f9561113c9a80e9",
					s: "0x5f8a25be83efa2326e6405c68e8bdf5c0e83894dbef7e31de39d8c073302a1f6",
					v: 28,
					signatureType: 2
				},
				taker: "0x0000000000000000000000000000000000000000"
			},
			orderStatus: {
				status: null,
				transactionHash: null,
				blockNumber: null
			},
			metadata: {}
		}
	]
};
