# thea-sdk

## Convert module

- Convert NFTs - Converts `tokenAmount` of Carbon Credit ERC1155 with specific `tokenId` into corresponding amounts of current base token, SDG, Rating and Vintage ERC20's. BaseTokenManager contract gets ownership(locks) ERC1155's and mint's new ERC20 tokens to users address.

```js
// call to unwrap method of Registry contract
const result = await theaSDK.convert.convertNFT(tokenId, tokenAmount);

// Sample output
{
    "id": "1", // token ID
    "amount": '10', // Converted Amount of ERC1155 Tokens
    "to": '0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76',
    "from": '0xbd44572e53343A0f003b719cf438C6338bD29d9C',
    ...
}
```

## Recover module

- Recover NFTs - Recovers `tokenAmount` of Carbon Credit ERC1155 with specific `tokenId` from corresponding amounts of current base token, SDG, Rating and Vintage ERC20's. BaseTokenManager contract sends to user ERC1155's and burns's ERC20 tokens in appropriate amonts.

```js
// call to unwrap method of Registry contract
const result = await theaSDK.recover.recoverNFT(tokenId, tokenAmount);

// Sample output
{
    "id": "1", // token ID
    "amount": '10', // Recovered Amount of ERC1155 Tokens
    "to": '0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76',
    "from": '0xbd44572e53343A0f003b719cf438C6338bD29d9C',
    ...
}
```

## Roll Tokens module

- Roll base tokens - Rolls `tokenAmount` of Base Token based on their `vintage`. This means that old Base Tokens (defined by sent `vintage`) and vintage tokens are burned and the same amount(`tokenAmount`) of new Base Tokens (defined by `vintage + 1`) is beeing minted. These Base Tokens addresses are defined in BaseTokenManager contract under `baseTokens` mapping with `vintage` as key.

```js
// call to unwrap method of Registry contract
const result = await theaSDK.rollBaseTokens.rollTokens(vintage, tokenAmount);

// Sample output
{
    "user": "0xbd44572e53343A0f003b719cf438C6338bD29d9C", // Address of user who rolled tokens
    "vintage": "2022", // Vintage of old Base Token
    "amount": '10', // Amount of base tokens rolled
    "to": '0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76',
    "from": '0xbd44572e53343A0f003b719cf438C6338bD29d9C',
    ...
}
```

## Unwrap module

- Unwrap token - Stores a request to untokenize the VCC token of type `id`, locks the tokens and emits event. Backend listens to event and process the request. Tokens are not burnt until backend calls `updateUnwrapRequest` function after processing and validating the transfer to offchain `offchainAccount` was succesful.

```js
// call to unwrap method of Registry contract
const result = await theaSDK.unwrap.unwrapToken(tokenId, amount, offchainAccount)

// Sample output
{
    "requestId": "2", // Request ID that we can use to fetch token state
    "to": "0xe135783649BfA7c9c4c6F8E528C7f56166efC8a6", // The rest of the output is ethers Transaction receipt
    "from": "0xbd44572e53343A0f003b719cf438C6338bD29d9C",
    ...
}
```

- Get unwrap token state - Returns the state of the unwrap token request.

```js
// call to requests mapping of Registry contract
const state = await theaSDK.unwrap.getUnwrapTokenState(tokenId)

// Sample output
{
    "status": 0,
    "maker": "0x123...",
    "tokenId": "1",
    "amount": "1000"
}
```

## Tokenization module

- Request tokenization

```js
const tokenizationState = await theaSDK.tokenization.requestTokenization(
    TokenizationSource.VERRA,
    accountId,
    batchId,
    {
      email: "john@test.com",
      ethAddr: "0x123...",
      fullName: "John",
    }
  )
// Sample output
{
    "result": {
        "uuid": "0000018631954fb292bd329c70fe6751", // tokenization ID
        "createdAt": "2023-02-08T15:11:54.291Z",
        "updatedAt": "2023-02-08T15:11:54.291Z",
        "email": "john@test.com",
        "fullName": "John",
        "ethAddr": "0x123...",
        "source": "verra",
        "subaccountId": "43163",
        "batchId": "11158-2891187991...",
        "status": "IN_QUEUE",
        ...
    },
    "error": null,
    "errorMessage": null
}
```

- Get tokenization state - Query tokenization state by tokenization ID

```js
const tokenizationState = await theaSDK.tokenization.getTokenizationState(tokenizationId);
```

- Tokenize - Used to claim tokens after tokenization request is performed and admin approves it

```js
const tokenizationState = await theaSDK.tokenization.tokenize(tokenizationId);
```

## Fungible trading

- Query token price - Used to fetch best price by calling Uniswap's V3 Quoter contract

```js
// Token in is "SDG" | "Vintage" | "Rating" | "CurrentNBT" | "Stable"

// From ERC20 to Stable coin
const priceInWEI = await theaSDK.fungibleTrading.queryTokenPrice({
	tokenIn: "SDG",
	amountIn: "1000000000000000000"
});

// From Stable coin to ERC20
const priceInWEI = await theaSDK.fungibleTrading.queryTokenPrice({
	tokenIn: "Stable",
	tokenOut: "SDG",
	amountIn: "1000000000000000000"
});
```

- Swap tokens - Used to swap tokens by calling Uniswap's V3 SwapRouter contract

```js
// From ERC20 to Stable coin
const transactionReceipt = await theaSDK.fungibleTrading.swapTokens({
	tokenIn: "SDG",
	amountIn: "1000000000000000000"
});

// From Stable coin to ERC20
const transactionReceipt = await theaSDK.fungibleTrading.swapTokens({
	tokenIn: "Stable",
	tokenOut: "SDG",
	amountIn: "1000000000000000000"
});
```

- **Note!** In order to use `CurrentNBT` token in swap or query token price methods you will have to specify his current address. You can do that by calling:

```js
theaSDK.setCurrentNBTContractAddress("0x123...");
```

## NFT orderbook

- Query token list - Returns a list of ERC1155 tokens that are available, and they are grouped by projectIDs and vintages

```js
const priceInWEI = await theaSDK.nftTokenList.getTokenList();

// Sample output
[
    {
        "projectID": 1748,
        "vintages": [
            { 
                "vintage": 2018,
                "tokenID": "1",
                ...
            }
        ]
    }
]
```

- Query Orders Info - Returns a list of orders for a given tokenID and owner

```js
const transactionReceipt = await theaSDK.nftOrderbook.queryOrdersInfo(tokenId, owner);

// Sample output
{
    "orders": [
        {
            "erc20Token": "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
            "erc20TokenAmount": "10000000000000000000",
            "nftToken": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
            "nftTokenId": "69",
            "nftTokenAmount": "100",
            "nftType": "ERC1155",
            "sellOrBuyNft": "buy",
            "chainId": "1337",
            "order": {
                "direction": 1,
                "erc20Token": "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
                "erc20TokenAmount": "10000000000000000000",
                "erc1155Token": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
                "erc1155TokenId": "69",
                "erc1155TokenAmount": "100",
                "erc1155TokenProperties": [],
                "expiry": "2524604400",
                "fees": [],
                "maker": "0x9342a65736a2e9c6a84a2adaba55ad1dc1f3a418",
                "nonce": "100131415900000000000000000000000000000096685863241593142117280893798097702934",
                "signature": {
                    "r": "0x39728a3bef397db69c6c6e1409ae6756c567a989894ad0787f9561113c9a80e9",
                    "s": "0x5f8a25be83efa2326e6405c68e8bdf5c0e83894dbef7e31de39d8c073302a1f6",
                    "v": 28,
                    "signatureType": 2
                },
                "taker": "0x0000000000000000000000000000000000000000"
            },
            "orderStatus": {
                "status": null, // null status indicates that order is not yet executed and is awailable for matching
                "transactionHash": null,
                "blockNumber": null
            },
            "metadata": {}
        },
        ...
    ]
}

```

- Query Price Listings - Returns sorted price listing for a given tokenID and side (buy or sell)



```js
const transactionReceipt = await theaSDK.nftOrderbook.queryPriceListing(tokenId, side);

// Sample output
[
	{
		"priceForOneNFT": 10,
		"nftTokenAmount": "10",
		"orderId": "100133271337000000000000000000000000000173830542377169720320941218856725572133",
		"orderToBeFilled": {
			"direction": 1,
			"erc20Token": "0xa6cbe96c05e92a01b52f519d50541409d85ed6d6",
			"erc20TokenAmount": "100000000000000000000",
			"erc1155Token": "0xf37221f42678ace417f2bc5c89489d1f0c77c133",
			"erc1155TokenId": "1",
			"erc1155TokenAmount": "10",
			"erc1155TokenProperties": [],
			"expiry": "2524604400",
			"fees": [],
			"maker": "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
			"nonce": "100133271337000000000000000000000000000173830542377169720320941218856725572133",
			"signature": {
				"r": "0x004c3187cd41552901eeda3b6aa8bf1934db4cbff9e080d193b30714a62f9ead",
				"s": "0x293711b92b8dd052bdaebd00b84f2997e67b0b6ba8cd699ad513173f2856c867",
				"v": 28,
				"signatureType": 2
			},
			"taker": "0x0000000000000000000000000000000000000000"
		}
	},
    ...
]

```

- Query Order By Nonce - Returns order for a given nonce (orderId)

```js
const transactionReceipt = await theaSDK.nftOrderbook.queryOrderByNonce(nonce);

// Sample output
{
    "orders": [
        {
            "erc20Token": "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
            "erc20TokenAmount": "10000000000000000000",
            "nftToken": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
            "nftTokenId": "69",
            "nftTokenAmount": "100",
            "nftType": "ERC1155",
            "sellOrBuyNft": "buy",
            "chainId": "1337",
            "order": {
                "direction": 1,
                "erc20Token": "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
                "erc20TokenAmount": "10000000000000000000",
                "erc1155Token": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
                "erc1155TokenId": "69",
                "erc1155TokenAmount": "100",
                "erc1155TokenProperties": [],
                "expiry": "2524604400",
                "fees": [],
                "maker": "0x9342a65736a2e9c6a84a2adaba55ad1dc1f3a418",
                "nonce": "100131415900000000000000000000000000000096685863241593142117280893798097702934",
                "signature": {
                    "r": "0x39728a3bef397db69c6c6e1409ae6756c567a989894ad0787f9561113c9a80e9",
                    "s": "0x5f8a25be83efa2326e6405c68e8bdf5c0e83894dbef7e31de39d8c073302a1f6",
                    "v": 28,
                    "signatureType": 2
                },
                "taker": "0x0000000000000000000000000000000000000000"
            },
            "orderStatus": {
                "status": null, // null status indicates that order is not yet executed and is awailable for matching
                "transactionHash": null,
                "blockNumber": null
            },
            "metadata": {}
        }
    ]
}
```

## NFT trading

- Enter Limit Order - Creates and submits an off-chain limit order (for specific `tokenId`, `side`, `price` and `quantity`) to the orderbook

```js
const priceInWEI = await theaSDK.nftTrading.enterNFTLimit(
		tokenId, // token id of the NFT
		side, // buy or sell
		price, // price of the NFT in Stablecoins
		quantity, // quantity of the NFT
		chunks? // number of chunks to split the order into (default 1), each chunk will be made into a separate limit order
	);

// Sample output
{
    "erc20Token": "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa",
    "erc20TokenAmount": "100000000000000",
    "nftToken": "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
    "nftTokenId": "113604032257357238510303590891918450986076622282835488971632849699550347132938",
    "nftTokenAmount": "1",
    "nftType": "ERC1155",
    "sellOrBuyNft": "buy",
    "chainId": "80001",
    "order": {
        "direction": 1,
        "erc20Token": "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa",
        "erc20TokenAmount": "100000000000000",
        "erc1155Token": "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
        "erc1155TokenId": "113604032257357238510303590891918450986076622282835488971632849699550347132938",
        "erc1155TokenAmount": "1",
        "erc1155TokenProperties": [],
        "expiry": "2524604400",
        "fees": [],
        "maker": "0x1e45d9f1be883653ebd1c3311866ec8fab9ba74a",
        "nonce": "100133271337000000000000000000000000000272122256199440695915800875629318974968",
        "signature": {
            "r": "0x103be09b2a88d1c2916a0f85c177cc9f84af3373efd7442d770416a38003ba7b",
            "s": "0x22ac77d199c445c5cf093ef1b6aace677efef0256f6b0d88cbfa4ae0d02b17a3",
            "v": 27,
            "signatureType": 2
        },
        "taker": "0x0000000000000000000000000000000000000000"
    },
    "orderStatus": {
        "status": null, // null status indicates that order is not yet executed and is awailable for matching
        "transactionHash": null,
        "blockNumber": null
    },
    "metadata": {}
}
```

- Cancel Order - Cancels order for specific orderId(`nonce`) on 0x Exchange Conctract and returns transaction receipt

```js
const transactionReceipt = await theaSDK.nftTrading.cancelOrder(orderId);
```

- Update Order - Updates specific order with new `price` and `quantity`. Which includes cancels order for specific orderId(`nonce`) on 0x Exchange Conctract, then creating and submiting new off-chain limit order (for specific `tokenId` and `side` (defined in previously cancelled order), `price` and `quantity` (function input parameters)) to the orderbook

```js
const transactionReceipt = await theaSDK.nftTrading.updateOrder(orderId, price, quantity);

// Sample output
{
    "erc20Token": "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa",
    "erc20TokenAmount": "100000000000000",
    "nftToken": "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
    "nftTokenId": "113604032257357238510303590891918450986076622282835488971632849699550347132938",
    "nftTokenAmount": "1",
    "nftType": "ERC1155",
    "sellOrBuyNft": "buy",
    "chainId": "80001",
    "order": {
        "direction": 1,
        "erc20Token": "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa",
        "erc20TokenAmount": "100000000000000",
        "erc1155Token": "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
        "erc1155TokenId": "113604032257357238510303590891918450986076622282835488971632849699550347132938",
        "erc1155TokenAmount": "1",
        "erc1155TokenProperties": [],
        "expiry": "2524604400",
        "fees": [],
        "maker": "0x1e45d9f1be883653ebd1c3311866ec8fab9ba74a",
        "nonce": "100133271337000000000000000000000000000272122256199440695915800875629318974968",
        "signature": {
            "r": "0x103be09b2a88d1c2916a0f85c177cc9f84af3373efd7442d770416a38003ba7b",
            "s": "0x22ac77d199c445c5cf093ef1b6aace677efef0256f6b0d88cbfa4ae0d02b17a3",
            "v": 27,
            "signatureType": 2
        },
        "taker": "0x0000000000000000000000000000000000000000"
    },
    "orderStatus": {
        "status": null, // null status indicates that order is not yet executed and is awailable for matching
        "transactionHash": null,
        "blockNumber": null
    },
    "metadata": {}
}
```

- Enter NFT Order at Market Price - Creates market order that is filling orders from orderbook (sorted by best prices) to `quantity` specified in method and returns transaction receipt for buy orders (batch buy of ERC1155), or receipt's for sell orders (they are not filled in batch, cause currently there is no such function on 0x Exchange Contract, instead they are filled one by one)

```js
const transactionReceipt = await theaSDK.nftTrading.enterNFTOrderAtMarket(tokenId, side, quantity);
```

- Fill order - Fills a specific `order` (that can be found by calling `queryPriceListings` and using `orderToBeFilled` parameter of desired order) to `amount` specified in a call. Returns transaction receipt

```js
const transactionReceipt = await theaSDK.nftOrderbook.fillOrder(order, amount);
```

