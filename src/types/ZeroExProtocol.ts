import { BigNumberish } from "@ethersproject/bignumber";
import { Overrides } from "@ethersproject/contracts";

export type ECSignature = {
	v: number;
	r: string;
	s: string;
};

export interface PostOrderRequestPayload {
	order: SignedERC1155OrderStructSerialized;
	chainId: string;
	metadata?: Record<string, string>;
}

export type PropertyStructSerialized = {
	propertyValidator: string;
	propertyData: string | Array<number>;
};

export type FeeStructSerialized = {
	recipient: string;
	amount: string;
	feeData: string;
};

export type PriceListings = {
	nftTokenAmount: string;
	priceForOneNFT: number;
	orderId: string;
	orderToBeFilled: SignedERC1155OrderStructSerialized;
};
export type OrderSide = "buy" | "sell";
export type ERC1155OrderStruct = {
	direction: BigNumberish;
	maker: string;
	taker: string;
	expiry: BigNumberish;
	nonce: BigNumberish;
	erc20Token: string;
	erc20TokenAmount: BigNumberish;
	fees: FeeStruct[];
	erc1155Token: string;
	erc1155TokenId: BigNumberish;
	erc1155TokenProperties: PropertyStruct[];
	erc1155TokenAmount: BigNumberish;
};
export type FeeStruct = {
	recipient: string;
	amount: BigNumberish;
	feeData: string | Array<number>;
};
export type PropertyStruct = {
	propertyValidator: string;
	propertyData: string | Array<number>;
};
export interface SignedERC1155OrderStructSerialized extends ERC1155OrderStructSerialized {
	signature: SignatureStructSerialized;
}

export interface SignedERC1155OrderStruct extends ERC1155OrderStruct {
	signature: SignatureStruct;
}

export type SignatureStruct = {
	signatureType: number; // 2 for EIP-712
	v: number;
	r: string;
	s: string;
};
export type SignatureStructSerialized = {
	signatureType: number; // 2 for EIP-712
	v: number;
	r: string;
	s: string;
};

export type ERC1155OrderStructSerialized = {
	direction: number;
	maker: string;
	taker: string;
	expiry: string;
	nonce: string;
	erc20Token: string;
	erc20TokenAmount: string;
	fees: FeeStructSerialized[];
	erc1155Token: string;
	erc1155TokenId: string;
	erc1155TokenProperties: PropertyStructSerialized[];
	erc1155TokenAmount: string;
};
export interface SearchOrdersResponsePayload {
	orders: Array<PostOrderResponsePayload>;
}

/**
 * Available query parameters for searching the orderbook
 */
export interface SearchOrdersParams {
	nftTokenId: string | string[];
	erc20Token: string | string[];
	nftToken: string | string[];
	nftType: "ERC721" | "ERC1155";
	chainId: string | number | string[] | number[];
	maker: string;
	taker: string;
	nonce: string | string[];
	offset: string | number;
	limit: string | number;
	sellOrBuyNft: "sell" | "buy";
	direction: "0" | "1";
	// Defaults to only 'open' orders
	status: "open" | "filled" | "expired" | "cancelled" | "all";
	visibility: "public" | "private";
	valid: "valid" | "all";
}
export interface OrderStructOptionsCommonStrict {
	direction: BigNumberish;
	// erc20Token: string;
	// erc20TokenAmount: BigNumberish;
	maker: string;
	appId?: string;
	taker?: string;
	expiry?: number | string;
	nonce?: BigNumberish;
	fees?: UserFacingFeeStruct[];
	tokenProperties?: PropertyStruct[];
}

export type Bytes = ArrayLike<number>;
export type BytesLike = Bytes | string;
export type UserFacingFeeStruct = {
	recipient: string;
	amount: BigNumberish;
	// Make fee data optional for devx (most folks don't use the feeData arg and it _needs_ to be '0x' if not being used).
	// automatically defaults to '0x'
	feeData?: BytesLike;
};
export enum TradeDirection {
	/**
	 * Sell orders are orders where direction is set to TradeDirection.SELL_NFT, which indicates that a maker wishes to sell an ERC721 token that they possess.
	 */
	SellNFT = 0,
	/**
	 * Buy orders are where direction is set to TradeDirection.BUY_NFT, which indicates that a maker wishes to buy an ERC721 token that they do not possess.
	 */
	BuyNFT = 1
}

export type MarketOrder = {
	ordersToBeFilled: MarketFillableOrder[];
	amount: number;
};
export type MarketFillableOrder = {
	order: SignedERC1155OrderStructSerialized;
	amount: number;
};
export interface UserFacingERC1155AssetDataSerializedV4 {
	tokenAddress: string;
	tokenId: string;
	type: "ERC1155";
	amount: string;
}
export interface UserFacingERC20AssetDataSerializedV4 {
	tokenAddress: string;
	type: "ERC20";
	amount: string;
}

export interface OrderStructOptionsCommon {
	direction: BigNumberish;
	maker: string;
	taker: string;
	appId: string;
	expiry: number | string;
	nonce: BigNumberish;
	// erc20Token: string;
	// erc20TokenAmount: BigNumberish;
	fees: UserFacingFeeStruct[];
	tokenProperties: PropertyStruct[];
}
export type PromiseOrValue<T> = T | Promise<T>;
export type TransactionOptions = Overrides & { from?: PromiseOrValue<string> };

export type ERC1155OrderStructPromiseOrValue = {
	direction: PromiseOrValue<BigNumberish>;
	maker: PromiseOrValue<string>;
	taker: PromiseOrValue<string>;
	expiry: PromiseOrValue<BigNumberish>;
	nonce: PromiseOrValue<BigNumberish>;
	erc20Token: PromiseOrValue<string>;
	erc20TokenAmount: PromiseOrValue<BigNumberish>;
	fees: FeeStructPromiseOrValue[];
	erc1155Token: PromiseOrValue<string>;
	erc1155TokenId: PromiseOrValue<BigNumberish>;
	erc1155TokenProperties: PropertyStructPromiseOrValue[];
	erc1155TokenAmount: PromiseOrValue<BigNumberish>;
};
export type SignatureStructPromiseOrValue = {
	signatureType: PromiseOrValue<BigNumberish>;
	v: PromiseOrValue<BigNumberish>;
	r: PromiseOrValue<BytesLike>;
	s: PromiseOrValue<BytesLike>;
};
export type FeeStructPromiseOrValue = {
	recipient: PromiseOrValue<string>;
	amount: PromiseOrValue<BigNumberish>;
	feeData: PromiseOrValue<BytesLike>;
};

export type PropertyStructPromiseOrValue = {
	propertyValidator: PromiseOrValue<string>;
	propertyData: PromiseOrValue<BytesLike>;
};

export interface PostOrderResponsePayload {
	erc20Token: string;
	erc20TokenAmount: string;
	nftToken: string;
	nftTokenId: string;
	nftTokenAmount: string;
	nftType: string;
	sellOrBuyNft: "buy" | "sell";
	chainId: string;
	order: SignedERC1155OrderStructSerialized;
	orderStatus: OrderStatus;
	metadata: Record<string, string> | null;
}
export type OrderStatus = {
	status: null | string;
	transactionHash: null | string;
	blockNumber: null | string;
};
