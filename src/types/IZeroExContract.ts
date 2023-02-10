import { BigNumberish } from "@ethersproject/bignumber";
import { Contract, ContractTransaction, Overrides, PayableOverrides } from "@ethersproject/contracts";
import { BytesLike, ERC1155OrderStructPromiseOrValue, PromiseOrValue, SignatureStructPromiseOrValue } from ".";

export interface IZeroExContract extends Contract {
	buyERC1155(
		sellOrder: ERC1155OrderStructPromiseOrValue,
		signature: SignatureStructPromiseOrValue,
		erc1155BuyAmount: PromiseOrValue<BigNumberish>,
		callbackData: PromiseOrValue<BytesLike>,
		overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
	): Promise<ContractTransaction>;

	cancelERC1155Order(
		orderNonce: PromiseOrValue<BigNumberish>,
		overrides?: Overrides & { from?: PromiseOrValue<string> }
	): Promise<ContractTransaction>;

	sellERC1155(
		buyOrder: ERC1155OrderStructPromiseOrValue,
		signature: SignatureStructPromiseOrValue,
		erc1155TokenId: PromiseOrValue<BigNumberish>,
		erc1155SellAmount: PromiseOrValue<BigNumberish>,
		unwrapNativeToken: PromiseOrValue<boolean>,
		callbackData: PromiseOrValue<BytesLike>,
		overrides?: Overrides & { from?: PromiseOrValue<string> }
	): Promise<ContractTransaction>;

	batchBuyERC1155s(
		sellOrders: ERC1155OrderStructPromiseOrValue[],
		signatures: SignatureStructPromiseOrValue[],
		erc1155TokenAmounts: PromiseOrValue<BigNumberish>[],
		callbackData: PromiseOrValue<BytesLike>[],
		revertIfIncomplete: PromiseOrValue<boolean>,
		overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
	): Promise<ContractTransaction>;
}
