import {
	OrderSide,
	SearchOrdersParams,
	// PostOrderRequestPayload,
	// PostOrderResponsePayload,
	SearchOrdersResponsePayload,
	// SignedERC1155OrderStruct,
	// SignedERC1155OrderStructSerialized,
	TheaNetwork
} from "src/types";
import { consts } from "src/utils/consts";
import { HttpClient } from "../shared/httpClient";

export class QueryPriceListing {
	readonly orderBook: HttpClient;
	readonly network: TheaNetwork;

	constructor(network: TheaNetwork) {
		this.network = network;
		this.orderBook = new HttpClient("https://api.trader.xyz/orderbook");
	}
	// private async postOrderToOrderbook(
	// 	signedOrder: SignedERC1155OrderStruct,
	// 	chainId: string | number,
	// 	metadata: Record<string, string> = {}
	// ) {
	// 	const payload: PostOrderRequestPayload = {
	// 		order: this.serializeNftOrder(signedOrder),
	// 		chainId: chainId.toString(10),
	// 		metadata
	// 	};
	// 	try {
	// 		const response = await this.orderBook.post<string, PostOrderResponsePayload>("/orders", JSON.stringify(payload));
	// 		return response;
	// 	} catch (error) {
	// 		throw new TheaError(error.message);
	// 	}
	// }
	async queryPriceListing(tokenId: string, side: OrderSide) {
		const response = await this.orderBook.get<SearchOrdersResponsePayload>("/orders", {
			nftToken: consts[`${this.network}`].theaERC1155Contract,
			nftTokenId: tokenId,
			sellOrBuyNft: side,
			status: "open",
			erc20Token: consts[`${this.network}`].stableCoinContract
		} as Partial<SearchOrdersParams>);
		const priceList: number[] = [];
		response.orders.forEach((element) => {
			priceList.push(parseInt(element.nftTokenAmount) / (parseInt(element.erc20TokenAmount) / 10 ** 18));
		});
		return priceList;
	}
	// private serializeNftOrder = (signedOrder: SignedERC1155OrderStruct): SignedERC1155OrderStructSerialized => {
	// 	if ("erc1155Token" in signedOrder) {
	// 		return {
	// 			...signedOrder,
	// 			direction: parseInt(signedOrder.direction.toString()),
	// 			expiry: signedOrder.expiry.toString(),
	// 			nonce: signedOrder.nonce.toString(),
	// 			erc20TokenAmount: signedOrder.erc20TokenAmount.toString(),
	// 			fees: signedOrder.fees.map((fee) => ({
	// 				...fee,
	// 				amount: fee.amount.toString(),
	// 				feeData: fee.feeData.toString()
	// 			})),
	// 			erc1155TokenAmount: signedOrder.erc1155TokenAmount.toString(),
	// 			erc1155TokenId: signedOrder.erc1155TokenId.toString()
	// 		};
	// 	} else {
	// 		console.log("unknown order format type erc1155", signedOrder);
	// 		throw new TheaError({ message: "Unknown asset type", type: "NFT_ORDER_SERILIZATION_ERROR" });
	// 	}
	// };
}
