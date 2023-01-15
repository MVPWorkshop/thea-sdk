import { BigNumber } from "@ethersproject/bignumber";
import { Wallet } from "@ethersproject/wallet";
import { approve, checkBalance, TheaERC1155, TheaERC20, TheaError } from "../../../src";
import { PRIVATE_KEY, WALLET_ADDRESS } from "../../mocks";

jest.mock("@ethersproject/wallet", () => {
	return {
		Wallet: jest.fn().mockImplementation(() => {
			return {
				getAddress: jest.fn().mockReturnValue(WALLET_ADDRESS)
			};
		})
	};
});

jest.mock("../../../src/modules/shared/theaERC20", () => {
	return {
		TheaERC20: jest.fn().mockReturnValue({
			approveERC20: jest.fn(),
			checkERC20Balance: jest.fn()
		})
	};
});

jest.mock("../../../src/utils/utils", () => {
	return {
		getERC20ContractAddress: jest.fn(),
		getBaseTokenERC20ContractAddress: jest.fn().mockImplementation(() => {
			return "0x123";
		})
	};
});

jest.mock("../../../src/modules/shared/theaERC1155", () => {
	return {
		TheaERC1155: jest.fn().mockReturnValue({
			approveERC1155: jest.fn(),
			checkERC1155Balance: jest.fn()
		})
	};
});
describe("tokenActions", () => {
	const signer = new Wallet(PRIVATE_KEY);
	const spender = WALLET_ADDRESS;
	const theaERC20 = new TheaERC20(signer, "Vintage");
	const theaERC1155 = new TheaERC1155(signer);
	const getAddressSpy = jest.spyOn(signer, "getAddress");
	const amount = BigNumber.from(100);
	afterEach(() => {
		getAddressSpy.mockClear();
	});

	describe("approve", () => {
		it("should approve ERC20 token", async () => {
			const approveERC20Spy = jest.spyOn(theaERC20, "approveERC20");
			await approve(signer, {
				token: "ERC20",
				spender,
				amount,
				tokenName: "Vintage"
			});
			expect(getAddressSpy).toBeCalledTimes(1);
			expect(approveERC20Spy).toHaveBeenCalledWith(WALLET_ADDRESS, spender, BigNumber.from(100));
		});

		it("should approve BaseERC20 token", async () => {
			const approveERC20Spy = jest.spyOn(theaERC20, "approveERC20");
			await approve(signer, {
				token: "BaseTokeneERC20",
				spender,
				amount,
				id: 1
			});
			expect(getAddressSpy).toBeCalledTimes(1);
			expect(approveERC20Spy).toHaveBeenCalledWith(WALLET_ADDRESS, spender, BigNumber.from(100));
		});

		it("should approve ERC1155 token", async () => {
			const approveERC1155Spy = jest.spyOn(theaERC1155, "approveERC1155");
			await approve(signer, {
				token: "ERC1155",
				spender
			});
			expect(getAddressSpy).toBeCalledTimes(1);
			expect(approveERC1155Spy).toHaveBeenCalledWith(WALLET_ADDRESS, spender);
		});

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		it("should throw error if token type is not supported", async () => {
			await expect(
				approve(signer, {
					token: "ERC721",
					spender
				} as any)
			).rejects.toThrow(new TheaError({ type: "NOT_SUPPORED_TOKEN_TYPE", message: "Token type does not exist" }));
		});
	});
	describe("checkBalance", () => {
		it("should check balance of ERC20 token", async () => {
			const checkERC20BalanceSpy = jest.spyOn(theaERC20, "checkERC20Balance");
			await checkBalance(signer, {
				token: "BaseTokeneERC20",
				amount,
				id: 1
			});
			expect(getAddressSpy).toBeCalledTimes(1);
			expect(checkERC20BalanceSpy).toHaveBeenCalledWith(WALLET_ADDRESS, amount);
		});

		it("should check balance of BaseERC20 token", async () => {
			const checkERC20BalanceSpy = jest.spyOn(theaERC20, "checkERC20Balance");
			await checkBalance(signer, {
				token: "ERC20",
				amount,
				tokenName: "Vintage"
			});
			expect(getAddressSpy).toBeCalledTimes(1);
			expect(checkERC20BalanceSpy).toHaveBeenCalledWith(WALLET_ADDRESS, amount);
		});

		it("should check balance of ERC1155 token", async () => {
			const tokenId = "1";
			const checkERC20BalanceSpy = jest.spyOn(theaERC1155, "checkERC1155Balance");
			await checkBalance(signer, {
				token: "ERC1155",
				amount,
				tokenId
			});
			expect(getAddressSpy).toBeCalledTimes(1);
			expect(checkERC20BalanceSpy).toHaveBeenCalledWith(WALLET_ADDRESS, tokenId, amount);
		});

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		it("should throw error if token type is not supported", async () => {
			await expect(
				checkBalance(signer, {
					token: "ERC721",
					spender
				} as any)
			).rejects.toThrow(new TheaError({ type: "NOT_SUPPORED_TOKEN_TYPE", message: "Token type does not exist" }));
		});
	});
});
