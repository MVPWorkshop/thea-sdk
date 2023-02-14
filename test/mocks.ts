import {
	OffsetHistory,
	OffsetStats,
	PriceListings,
	SearchOrdersResponsePayload,
	TokenizationHistory,
	TokenizationSource,
	TokenizationState,
	TokenizationStats,
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
export const postOrderResponseMock = {
	erc20Token: "0xd393b1e02da9831ff419e22ea105aae4c47e1253",
	erc20TokenAmount: "12000000000000000000",
	nftToken: "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
	nftTokenId: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
	nftTokenAmount: "1",
	nftType: "ERC1155",
	sellOrBuyNft: "sell",
	chainId: "80001",
	order: {
		direction: 0,
		erc20Token: "0xd393b1e02da9831ff419e22ea105aae4c47e1253",
		erc20TokenAmount: "12000000000000000000",
		erc1155Token: "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
		erc1155TokenId: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
		erc1155TokenAmount: "1",
		erc1155TokenProperties: [],
		expiry: "2524604400",
		fees: [],
		maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
		nonce: "100133271337000000000000000000000000000206548818982333778442832641797464560524",
		signature: {
			r: "0x396f2d0a0328e9d96e41fe9c58b61d8d19c1051569796135a1d44ab55aa5d57c",
			s: "0x220f98a893146109b2a2a9b4832c9cdf39d9b5e353a274e1829360840080638c",
			v: 27,
			signatureType: 2
		},
		taker: "0x0000000000000000000000000000000000000000"
	},
	orderStatus: { status: null, transactionHash: null, blockNumber: null },
	metadata: {}
};
export const priceListingMock: SearchOrdersResponsePayload = {
	orders: [
		{
			erc20Token: "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
			erc20TokenAmount: "10000000000000000000",
			nftToken: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
			nftTokenId: "69",
			nftTokenAmount: "100",
			nftType: "ERC1155",
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
		},
		{
			erc20Token: "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
			erc20TokenAmount: "100000000000000000",
			nftToken: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
			nftTokenId: "69",
			nftTokenAmount: "10",
			nftType: "ERC1155",
			sellOrBuyNft: "buy",
			chainId: "1337",
			order: {
				direction: 1,
				erc20Token: "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
				erc20TokenAmount: "100000000000000000",
				erc1155Token: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
				erc1155TokenId: "69",
				erc1155TokenAmount: "10",
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

export const priceListingReturnMockSell: PriceListings[] = [
	{
		priceForOneNFT: 20,
		nftTokenAmount: "10",
		orderId: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
		orderToBeFilled: {
			direction: 0,
			erc20Token: "0xa6cbe96c05e92a01b52f519d50541409d85ed6d6",
			erc20TokenAmount: "200000000000000000000",
			erc1155Token: "0xf37221f42678ace417f2bc5c89489d1f0c77c133",
			erc1155TokenId: "1",
			erc1155TokenAmount: "10",
			erc1155TokenProperties: [],
			expiry: "2524604400",
			fees: [],
			maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
			nonce: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
			signature: {
				r: "0x004c3187cd41552901eeda3b6aa8bf1934db4cbff9e080d193b30714a62f9ead",
				s: "0x293711b92b8dd052bdaebd00b84f2997e67b0b6ba8cd699ad513173f2856c867",
				v: 28,
				signatureType: 2
			},
			taker: "0x0000000000000000000000000000000000000000"
		}
	},
	{
		priceForOneNFT: 10,
		nftTokenAmount: "10",
		orderId: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
		orderToBeFilled: {
			direction: 0,
			erc20Token: "0xa6cbe96c05e92a01b52f519d50541409d85ed6d6",
			erc20TokenAmount: "100000000000000000000",
			erc1155Token: "0xf37221f42678ace417f2bc5c89489d1f0c77c133",
			erc1155TokenId: "1",
			erc1155TokenAmount: "10",
			erc1155TokenProperties: [],
			expiry: "2524604400",
			fees: [],
			maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
			nonce: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
			signature: {
				r: "0x004c3187cd41552901eeda3b6aa8bf1934db4cbff9e080d193b30714a62f9ead",
				s: "0x293711b92b8dd052bdaebd00b84f2997e67b0b6ba8cd699ad513173f2856c867",
				v: 28,
				signatureType: 2
			},
			taker: "0x0000000000000000000000000000000000000000"
		}
	}
];

export const priceListingReturnMockBuy: PriceListings[] = [
	{
		priceForOneNFT: 10,
		nftTokenAmount: "10",
		orderId: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
		orderToBeFilled: {
			direction: 1,
			erc20Token: "0xa6cbe96c05e92a01b52f519d50541409d85ed6d6",
			erc20TokenAmount: "100000000000000000000",
			erc1155Token: "0xf37221f42678ace417f2bc5c89489d1f0c77c133",
			erc1155TokenId: "1",
			erc1155TokenAmount: "10",
			erc1155TokenProperties: [],
			expiry: "2524604400",
			fees: [],
			maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
			nonce: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
			signature: {
				r: "0x004c3187cd41552901eeda3b6aa8bf1934db4cbff9e080d193b30714a62f9ead",
				s: "0x293711b92b8dd052bdaebd00b84f2997e67b0b6ba8cd699ad513173f2856c867",
				v: 28,
				signatureType: 2
			},
			taker: "0x0000000000000000000000000000000000000000"
		}
	},
	{
		priceForOneNFT: 20,
		nftTokenAmount: "10",
		orderId: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
		orderToBeFilled: {
			direction: 1,
			erc20Token: "0xa6cbe96c05e92a01b52f519d50541409d85ed6d6",
			erc20TokenAmount: "200000000000000000000",
			erc1155Token: "0xf37221f42678ace417f2bc5c89489d1f0c77c133",
			erc1155TokenId: "1",
			erc1155TokenAmount: "10",
			erc1155TokenProperties: [],
			expiry: "2524604400",
			fees: [],
			maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
			nonce: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
			signature: {
				r: "0x004c3187cd41552901eeda3b6aa8bf1934db4cbff9e080d193b30714a62f9ead",
				s: "0x293711b92b8dd052bdaebd00b84f2997e67b0b6ba8cd699ad513173f2856c867",
				v: 28,
				signatureType: 2
			},
			taker: "0x0000000000000000000000000000000000000000"
		}
	}
];

export const tokenizationHistory: TokenizationHistory[] = [
	{
		id: "1",
		projectId: "1748",
		vintage: "2019"
	},
	{
		id: "2",
		projectId: "1749",
		vintage: "2020"
	},
	{
		id: "3",
		projectId: "1750",
		vintage: "2021"
	}
];

export const tokenizationStats: TokenizationStats = {
	id: "1",
	projectId: "1748",
	vintage: "2019",
	tokenURI: "1.json",
	activeAmount: "99000",
	mintedAmount: "100000",
	retiredAmount: "1000",
	unwrappedAmount: "0"
};

export const offsetHistory: OffsetHistory[] = [
	{
		id: "1-1360-0",
		amount: "1000",
		timestamp: "1676365774"
	},
	{
		id: "1-1361-0",
		amount: "2000",
		timestamp: "1676365999"
	}
];

export const offsetStats: OffsetStats = {
	id: "1-1360-0",
	amount: "1000",
	timestamp: "1676365999",
	token: {
		id: "1",
		projectId: "1748",
		vintage: "2019",
		tokenURI: "1.json",
		activeAmount: "99000",
		mintedAmount: "100000",
		retiredAmount: "1000",
		unwrappedAmount: "0"
	}
};
