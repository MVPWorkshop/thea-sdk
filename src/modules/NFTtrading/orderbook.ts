import {
	OrderSide,
	PostOrderRequestPayload,
	PostOrderResponsePayload,
	PriceListings,
	SearchOrdersParams,
	SearchOrdersResponsePayload,
	SignedERC1155OrderStruct,
	SignedERC1155OrderStructSerialized,
	TheaNetwork
} from "src/types";
import { consts, ORDERBOOK_URL, STABLE_TOKEN_DECIMALS_MULTIPLIER } from "src/utils/consts";
import { HttpClient } from "../shared/httpClient";

export class Orderbook {
	readonly httpClient: HttpClient;
	readonly network: TheaNetwork;

	constructor(network: TheaNetwork) {
		this.network = network;
		this.httpClient = new HttpClient(ORDERBOOK_URL);
	}

	async queryOrdersInfo(tokenId: string, owner: string) {
		const response = await this.httpClient.get<SearchOrdersResponsePayload>("/orders", {
			nftToken: consts[`${this.network}`].theaERC1155Contract,
			chainId: this.network.toString(),
			nftTokenId: tokenId,
			status: "all",
			maker: owner,
			erc20Token: consts[`${this.network}`].stableTokenContract
		} as Partial<SearchOrdersParams>);

		return response.orders;
	}

	async queryOrderByNonce(nonce: string) {
		const response = await this.httpClient.get<SearchOrdersResponsePayload>("/orders", {
			nftToken: consts[`${this.network}`].theaERC1155Contract,
			chainId: this.network.toString(),
			nonce: nonce,
			status: "all",
			erc20Token: consts[`${this.network}`].stableTokenContract
		} as Partial<SearchOrdersParams>);
		return response.orders[0];
	}
	// returns a sorted (ascending) list of prices, amounts of NFTs being sold, and orderId that can be bought/sold for specific token id
	// side is either "buy" or "sell", and it represents whether the maker of the original order wants to buy or sell NFTs
	// price is the price of 1 NFT in stable tokens, and it's soreted depending on the side
	async queryPriceListing(tokenId: string, side: OrderSide): Promise<PriceListings[]> {
		const response = await this.httpClient.get<SearchOrdersResponsePayload>("/orders", {
			nftToken: consts[`${this.network}`].theaERC1155Contract,
			chainId: this.network.toString(),
			nftTokenId: tokenId,
			sellOrBuyNft: side,
			status: "open",
			erc20Token: consts[`${this.network}`].stableTokenContract
		} as Partial<SearchOrdersParams>);
		const priceList = response.orders.map((element) => {
			return {
				priceForOneNFT:
					parseInt(element.erc20TokenAmount) / STABLE_TOKEN_DECIMALS_MULTIPLIER / parseInt(element.nftTokenAmount),
				nftTokenAmount: element.nftTokenAmount,
				orderId: element.order.nonce
			} as PriceListings;
		});
		if (side == "sell") {
			return priceList.sort((a, b) => a.priceForOneNFT - b.priceForOneNFT);
		} else {
			return priceList.sort((a, b) => b.priceForOneNFT - a.priceForOneNFT);
		}
	}

	async postOrder(signedOrder: SignedERC1155OrderStruct) {
		const payload: PostOrderRequestPayload = {
			order: this.serializeNftOrder(signedOrder),
			chainId: this.network.toString()
		};
		const response = await this.httpClient.post<PostOrderRequestPayload, PostOrderResponsePayload>("/order", payload);
		return response;
	}

	serializeNftOrder(signedOrder: SignedERC1155OrderStruct): SignedERC1155OrderStructSerialized {
		return {
			...signedOrder,
			direction: parseInt(signedOrder.direction.toString()),
			expiry: signedOrder.expiry.toString(),
			nonce: signedOrder.nonce.toString(),
			erc20TokenAmount: signedOrder.erc20TokenAmount.toString(),
			fees: [],
			erc1155TokenAmount: signedOrder.erc1155TokenAmount.toString(),
			erc1155TokenId: signedOrder.erc1155TokenId.toString()
		};
	}
}
