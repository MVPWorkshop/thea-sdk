# thea-sdk

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
