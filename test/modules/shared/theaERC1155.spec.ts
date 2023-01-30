import { Wallet } from "@ethersproject/wallet";
import { consts, ContractDetails, IERC1155Contract, TheaERC1155, TheaError, TheaNetwork } from "../../../src";
import { PRIVATE_KEY, WALLET_ADDRESS } from "../../mocks";
import * as utils from "../../../src/utils/utils";
import * as shared from "../../../src/modules/shared";
import { ContractReceipt, ContractTransaction } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";

const theaERC1155ContractAddress = consts[TheaNetwork.GOERLI].theaERC1155Contract;
jest.mock("../../../src/modules/shared/execute", () => {
	return {
		execute: jest.fn().mockImplementation(() => {
			return {
				to: theaERC1155ContractAddress,
				from: "0x123",
				contractAddress: theaERC1155ContractAddress
			};
		})
	};
});

describe("TheaERC1155", () => {
	const signer = new Wallet(PRIVATE_KEY);
	const theaERC1155: TheaERC1155 = new TheaERC1155(signer, TheaNetwork.GOERLI);
	const owner = WALLET_ADDRESS;
	const spender = WALLET_ADDRESS;
	const tokenId = "1";
	const mockContract: Partial<IERC1155Contract> = {
		isApprovedForAll: jest.fn(),
		setApprovalForAll: jest.fn(),
		balanceOf: jest.fn()
	};

	const contractReceipt: Partial<ContractReceipt> = {
		to: theaERC1155ContractAddress,
		from: spender,
		contractAddress: theaERC1155ContractAddress
	};
	const tx: Partial<ContractTransaction> = {
		from: spender,
		wait: () => Promise.resolve(contractReceipt as ContractReceipt)
	};

	theaERC1155.contract = mockContract as IERC1155Contract;
	let validateAddressSpy: jest.SpyInstance;

	beforeEach(() => {
		validateAddressSpy = jest.spyOn(utils, "validateAddress");
	});

	afterEach(() => {
		validateAddressSpy.mockClear();
	});

	it("should return boolean for checking isApprovedForAll", async () => {
		const isApprovedForAllSpy = jest.spyOn(mockContract, "isApprovedForAll").mockResolvedValueOnce(true);

		const result = await theaERC1155.isApprovedForAll(owner, spender);

		expect(isApprovedForAllSpy).toBeCalledWith(owner, spender);
		expect(validateAddressSpy).toHaveBeenCalledTimes(2);
		expect(result).toBe(true);
	});

	it("should set approval for all", async () => {
		const txPromise = Promise.resolve(tx as ContractTransaction);
		const setApprovalForAllSpy = jest.spyOn(mockContract, "setApprovalForAll").mockReturnValue(txPromise);
		const executeSpy = jest.spyOn(shared, "execute");
		const details: ContractDetails & { contractFunction: string } = {
			contractFunction: "setApprovalForAll",
			address: theaERC1155ContractAddress,
			name: "TheaERC1155"
		};

		await theaERC1155.setApprovalForAll(spender);

		expect(setApprovalForAllSpy).toHaveBeenCalledWith(spender, true);
		expect(validateAddressSpy).toHaveBeenCalledTimes(1);
		expect(executeSpy).toHaveBeenCalledWith(txPromise, details);
	});

	describe("approveERC1155", () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});
		it("should skip approval if already approved", async () => {
			const isApprovedForAllSpy = jest.spyOn(theaERC1155, "isApprovedForAll").mockResolvedValueOnce(true);
			const setApprovalForAllSpy = jest.spyOn(theaERC1155, "setApprovalForAll");

			await theaERC1155.approveERC1155(owner, spender);

			expect(isApprovedForAllSpy).toHaveBeenCalledWith(owner, spender);
			expect(setApprovalForAllSpy).not.toBeCalled();
		});

		it("should approve if not already approved", async () => {
			const isApprovedForAllSpy = jest.spyOn(theaERC1155, "isApprovedForAll").mockResolvedValueOnce(false);
			const setApprovalForAllSpy = jest
				.spyOn(theaERC1155, "setApprovalForAll")
				.mockResolvedValueOnce(contractReceipt as ContractReceipt);

			await theaERC1155.approveERC1155(owner, spender);

			expect(isApprovedForAllSpy).toHaveBeenCalledWith(owner, spender);
			expect(setApprovalForAllSpy).toHaveBeenCalledWith(spender);
		});
	});

	describe("check ERC1155 balance", () => {
		it("should not throw error if balance is greater than amount", async () => {
			const balanceOfSpy = jest.spyOn(mockContract, "balanceOf").mockResolvedValueOnce(BigNumber.from("10000"));
			await theaERC1155.checkERC1155Balance(owner, tokenId, BigNumber.from("1000"));
			expect(balanceOfSpy).toHaveBeenCalledWith(owner, tokenId);
		});

		it("should throw error if balance is less than amount", async () => {
			jest.spyOn(mockContract, "balanceOf").mockResolvedValueOnce(BigNumber.from("1000"));
			await expect(theaERC1155.checkERC1155Balance(owner, tokenId, BigNumber.from("10000"))).rejects.toThrow(
				new TheaError({ type: "INSUFFICIENT_FUNDS", message: "Insufficient Thea ERC1155 funds" })
			);
		});
	});
});
