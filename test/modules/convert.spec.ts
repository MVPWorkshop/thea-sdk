import { BigNumber } from "@ethersproject/bignumber";
import { ContractTransaction, Event } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { BASE_TOKEN_MANAGER_CONTRACT_ADDRESS, Events, TheaError, Convert, IBaseTokenManagerContract } from "../../src";
import { PRIVATE_KEY } from "../mocks";
import * as shared from "../../src/modules/shared";
import BaseTokenManager_ABI from "../../src/abi/BaseTokenManager_ABI.json";

jest.mock("../../src/modules/shared", () => {
	return {
		checkBalance: jest.fn(),
		approve: jest.fn(),
		executeWithResponse: jest.fn().mockImplementation(() => {
			return {
				to: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS,
				from: "0x123",
				contractAddress: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS,
				id: "1",
				amount: "1000"
			};
		})
	};
});

describe("Convert", () => {
	const providerOrSigner = new Wallet(PRIVATE_KEY);
	let convert: Convert;
	const tokenId = "1";
	const amount = BigNumber.from(1000);

	const contractTransaction: Partial<ContractTransaction> = {
		wait: jest.fn().mockResolvedValue({
			to: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS,
			from: "0x123",
			contractAddress: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS
		})
	};

	const mockContract: Partial<IBaseTokenManagerContract> = {
		convert: jest.fn().mockResolvedValue(contractTransaction as ContractTransaction)
	};

	beforeEach(() => {
		convert = new Convert(providerOrSigner);
		convert.contract = mockContract as IBaseTokenManagerContract;
	});

	describe("convertNFT", () => {
		it("should throw error that signer is required", async () => {
			convert = new Convert(new JsonRpcProvider());
			await expect(convert.convertNFT(tokenId, amount)).rejects.toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});

		it("should throw error if amount is not valid", async () => {
			await expect(convert.convertNFT(tokenId, BigNumber.from(-1))).rejects.toThrow(
				new TheaError({
					type: "INVALID_TOKEN_AMOUNT_VALUE",
					message: "Amount should be greater than 0"
				})
			);
		});

		it("should call convert method from contract", async () => {
			const txPromise = Promise.resolve(contractTransaction as ContractTransaction);
			const convertSpy = jest.spyOn(convert.contract, "convert").mockReturnValue(txPromise);
			const checkBalanceSpy = jest.spyOn(shared, "checkBalance");
			const approveSpy = jest.spyOn(shared, "approve");
			const executeSpy = jest.spyOn(shared, "executeWithResponse");

			const result = await convert.convertNFT(tokenId, amount);
			expect(checkBalanceSpy).toHaveBeenCalledWith(providerOrSigner, { token: "ERC1155", tokenId, amount });
			expect(approveSpy).toHaveBeenCalledWith(providerOrSigner, {
				token: "ERC1155",
				spender: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS
			});
			expect(executeSpy).toHaveBeenCalledWith(
				txPromise,
				{
					name: BaseTokenManager_ABI.contractName,
					address: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS,
					contractFunction: "convert"
				},
				convert.extractIdAndAmountFromEvent
			);
			expect(convertSpy).toHaveBeenCalledWith(tokenId, amount);
			expect(result).toMatchObject({
				to: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS,
				from: "0x123",
				contractAddress: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS
			});
		});
	});

	describe("extractIdAndAmountFromEvent", () => {
		it("should return undefined id and amount if no events passed", () => {
			const result = convert.extractIdAndAmountFromEvent();
			expect(result.id).toBeUndefined();
			expect(result.amount).toBeUndefined();
		});

		it("should return undefined id and amount if no Convert event passed", () => {
			const result = convert.extractIdAndAmountFromEvent();
			expect(result.id).toBeUndefined();
			expect(result.amount).toBeUndefined();
		});

		it("should return undefined id and amount if no args in event", () => {
			const event: Partial<Event> = {
				event: Events.convert
			};
			const result = convert.extractIdAndAmountFromEvent([event as Event]);
			expect(result.id).toBeUndefined();
			expect(result.amount).toBeUndefined();
		});

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		it("should extract id and amount from event", () => {
			const tokenId = "1";
			const amount = "1000";
			const event: Partial<Event> = {
				event: Events.convert,
				args: { tokenId, amount } as any
			};
			const result = convert.extractIdAndAmountFromEvent([event as Event]);
			expect(result.id).toBe("1");
			expect(result.amount).toBe("1000");
		});
	});
});
