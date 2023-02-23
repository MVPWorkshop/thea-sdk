import { BigNumber } from "@ethersproject/bignumber";
import { ContractTransaction, Event } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Events, TheaError, RollBaseTokens, IBaseTokenManagerContract, TheaNetwork, consts } from "../../src";
import { CONTRACT_ADDRESS, PRIVATE_KEY } from "../mocks";
import * as shared from "../../src/modules/shared";
import BaseTokenManager_ABI from "../../src/abi/BaseTokenManager_ABI.json";

const baseTokenManagerContractAddress = consts[TheaNetwork.GANACHE].baseTokenManagerContract;
jest.mock("../../src/modules/shared", () => {
	return {
		checkBalance: jest.fn(),
		approve: jest.fn(),
		executeWithResponse: jest.fn().mockImplementation(() => {
			return {
				to: baseTokenManagerContractAddress,
				from: "0x123",
				contractAddress: baseTokenManagerContractAddress,
				vintage: "2021",
				user: "0x123",
				amount: "1000"
			};
		}),
		TheaERC20: jest.fn().mockImplementation(() => {
			return {
				checkERC20Balance: jest.fn(),
				approveERC20: jest.fn()
			};
		})
	};
});

describe("RollTokens", () => {
	const providerOrSigner = new Wallet(PRIVATE_KEY);
	let rollTokens: RollBaseTokens;
	const vintage = "2017";
	const user = "0x123";
	const amount = BigNumber.from(1000);
	const network = TheaNetwork.GANACHE;
	const contractTransaction: Partial<ContractTransaction> = {
		wait: jest.fn().mockResolvedValue({
			to: baseTokenManagerContractAddress,
			from: "0x123",
			contractAddress: baseTokenManagerContractAddress
		})
	};

	const mockContract: Partial<IBaseTokenManagerContract> = {
		rollTokens: jest.fn().mockResolvedValue(contractTransaction as ContractTransaction),
		baseTokens: jest.fn().mockImplementation((...args) => {
			if (args[0] === 2017) return CONTRACT_ADDRESS;
			else return "0x0000000000000000000000000000000000000000";
		})
	};

	beforeEach(() => {
		rollTokens = new RollBaseTokens(providerOrSigner, network);
		rollTokens.contract = mockContract as IBaseTokenManagerContract;
	});

	describe("rollTokens", () => {
		it("should throw error that signer is required", async () => {
			rollTokens = new RollBaseTokens(new JsonRpcProvider(), network);
			await expect(rollTokens.rollTokens(vintage, amount)).rejects.toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});

		it("should throw error if amount is not valid", async () => {
			await expect(rollTokens.rollTokens(vintage, BigNumber.from(-1))).rejects.toThrow(
				new TheaError({
					type: "INVALID_TOKEN_AMOUNT_VALUE",
					message: "Amount should be greater than 0"
				})
			);
		});

		it("should throw error if token address is not found for vintage", async () => {
			await expect(rollTokens.rollTokens(2011, amount)).rejects.toThrow(
				new TheaError({ type: "TOKEN_NOT_FOUND", message: `Token by 2011 vintage not found` })
			);
		});

		it("should call rollTokens method from contract", async () => {
			const txPromise = Promise.resolve(contractTransaction as ContractTransaction);
			const rollTokensSpy = jest.spyOn(rollTokens.contract, "rollTokens").mockReturnValue(txPromise);
			const checkBalanceSpy = jest.spyOn(shared, "checkBalance");
			const approveSpy = jest.spyOn(shared, "approve");
			const executeSpy = jest.spyOn(shared, "executeWithResponse");

			const result = await rollTokens.rollTokens(vintage, amount);
			expect(checkBalanceSpy).toBeCalled();
			expect(approveSpy).toBeCalled();
			expect(executeSpy).toHaveBeenCalledWith(
				txPromise,
				{
					name: BaseTokenManager_ABI.contractName,
					address: baseTokenManagerContractAddress,
					contractFunction: "rollTokens"
				},
				rollTokens.extractInfoFromEvent
			);
			expect(rollTokensSpy).toHaveBeenCalledWith(vintage, amount);
			expect(result).toMatchObject({
				to: baseTokenManagerContractAddress,
				from: "0x123",
				contractAddress: baseTokenManagerContractAddress
			});
		});
	});

	describe("extractInfoFromEvent", () => {
		it("should return undefined user, vintage and amount if no events passed", () => {
			const result = rollTokens.extractInfoFromEvent();
			expect(result.user).toBeUndefined();
			expect(result.vintage).toBeUndefined();
			expect(result.amount).toBeUndefined();
		});

		it("should return undefined user, vintage and amount if no RollBaseTokens event passed", () => {
			const result = rollTokens.extractInfoFromEvent();
			expect(result.user).toBeUndefined();
			expect(result.vintage).toBeUndefined();
			expect(result.amount).toBeUndefined();
		});

		it("should return undefined user, vintage and amount if no args in event", () => {
			const event: Partial<Event> = {
				event: Events.rollTokens
			};
			const result = rollTokens.extractInfoFromEvent([event as Event]);
			expect(result.user).toBeUndefined();
			expect(result.vintage).toBeUndefined();
			expect(result.amount).toBeUndefined();
		});

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		it("should extract user, vintage and amount from event", () => {
			const event: Partial<Event> = {
				event: Events.rollTokens,
				args: { vintage, user, amount } as any
			};
			const result = rollTokens.extractInfoFromEvent([event as Event]);
			expect(result.user).toBe(user);
			expect(result.vintage).toBe(vintage);
			expect(result.amount).toBe(amount.toString());
		});
	});
});
