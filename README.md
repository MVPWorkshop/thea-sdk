# Thea SDK [![npm version](https://badge.fury.io/js/@mcovilo%2Fthea-sdk.svg)](https://badge.fury.io/js/@mcovilo%2Fthea-sdk)

This is official JS SDK for Thea Protocol

## SDK Initialization

Depending on the platform you're using, there are different ways to initialize the SDK. Below are few samples

```js
// Client side
const theaSDK = await TheaSDK.init({
	network: TheaNetwork.MUMBAI,
	web3Provider: new ethers.providers.Web3Provider(window.ethereum)
});

// Server side with private key and provider
const theaSDK = await TheaSDK.init({
	network: TheaNetwork.MUMBAI,
	privateKey: "123...",
	provider: new ethers.providers.AlchemyProvider(80001, "apiKey")
});

// Server side with signer
const theaSDK = await TheaSDK.init({
	network: TheaNetwork.MUMBAI,
	signer: new Wallet(privateKey, provider)
});
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
