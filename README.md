# thea-sdk

## Unwrap module

- Unwrap token (call to unwrap method of Registry contract)

```js
const result = await theaSDK.unwrap.unwrapToken(tokenId, amount, offchainAccount)

// Sample output
{
    "requestId": "2", // Request ID that we can use to fetch token state
    "to": "0xe135783649BfA7c9c4c6F8E528C7f56166efC8a6", // The rest of the output is ethers Transaction receipt
    "from": "0xbd44572e53343A0f003b719cf438C6338bD29d9C",
    ...
}
```

- Get unwrap token state (call to requests mapping of Registry contract)

```js
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
