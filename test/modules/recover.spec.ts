import { BigNumber } from "@ethersproject/bignumber";
import { Contract, ContractTransaction, Event } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
	BASE_TOKEN_MANAGER_CONTRACT_ADDRESS,
	Events,
	TheaError,
	Recover,
	IBaseTokenManagerContract,
	REGISTRY_CONTRACT_ADDRESS,
	castAbiInterface,
	BaseTokenCharactaristics
} from "../../src";
import { PRIVATE_KEY } from "../mocks";
import * as shared from "../../src/modules/shared";
import BaseTokenManager_ABI from "../../src/abi/BaseTokenManager_ABI.json";
import Registry_ABI from "../../src/abi/Registry_ABI.json";

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
				amount: "1000",
				msgSender: "0x123"
			};
		})
	};
});

describe("Recover", () => {
	const providerOrSigner = new Wallet(PRIVATE_KEY);
	let recover: Recover;
	const tokenId = "1";
	const amount = BigNumber.from(1000);

	const contractTransaction: Partial<ContractTransaction> = {
		wait: jest.fn().mockResolvedValue({
			to: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS,
			from: "0x123",
			contractAddress: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS
		})
	};

	const baseTokenCharacteristicsTransaction: Partial<BaseTokenCharactaristics> = {
		vintage: BigNumber.from(2022),
		sdgsCount: BigNumber.from(1),
		rating: BigNumber.from(5)
	};

	const calculateBaseTokensAmountsTransaction: Partial<{
		btVintage: BigNumber;
		sdg: BigNumber;
		vintage: BigNumber;
		rating: BigNumber;
	}> = {
		vintage: BigNumber.from(2022),
		sdg: BigNumber.from(1),
		rating: BigNumber.from(5),
		btVintage: BigNumber.from(2020)
	};

	const mockContract: Partial<IBaseTokenManagerContract> = {
		recover: jest.fn().mockResolvedValue(contractTransaction as ContractTransaction),
		baseCharacteristics: jest.fn().mockResolvedValue(baseTokenCharacteristicsTransaction as ContractTransaction)
	};

	beforeEach(() => {
		const registry = new Contract(REGISTRY_CONTRACT_ADDRESS, castAbiInterface(Registry_ABI.abi), providerOrSigner);
		recover = new Recover(providerOrSigner, registry);
		recover.contract = mockContract as IBaseTokenManagerContract;
	});

	describe("recoverNFT", () => {
		it("should throw error that signer is required", async () => {
			const registry = new Contract(REGISTRY_CONTRACT_ADDRESS, castAbiInterface(Registry_ABI.abi), providerOrSigner);
			recover = new Recover(new JsonRpcProvider(), registry);
			await expect(recover.recoverNFT(tokenId, amount)).rejects.toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});

		it("should throw error if amount is not valid", async () => {
			await expect(recover.recoverNFT(tokenId, BigNumber.from(-1))).rejects.toThrow(
				new TheaError({
					type: "INVALID_TOKEN_AMOUNT_VALUE",
					message: "Amount should be greater than 0"
				})
			);
		});

		it("should call recover method from contract", async () => {
			const txPromise = Promise.resolve(contractTransaction as ContractTransaction);
			const baseCharacteristicsTxPromise = Promise.resolve(
				baseTokenCharacteristicsTransaction as BaseTokenCharactaristics
			);
			const calculateBaseTokensAmountsTxPromise = Promise.resolve(
				calculateBaseTokensAmountsTransaction as {
					btVintage: BigNumber;
					sdg: BigNumber;
					vintage: BigNumber;
					rating: BigNumber;
				}
			);
			const recoverSpy = jest.spyOn(recover.contract, "recover").mockReturnValue(txPromise);
			const calculateBaseTokensAmountsSpy = jest
				.spyOn(recover, "calculateBaseTokensAmounts")
				.mockReturnValue(calculateBaseTokensAmountsTxPromise);
			const baseCharacteristicsSpy = jest
				.spyOn(recover.contract, "baseCharacteristics")
				.mockReturnValue(baseCharacteristicsTxPromise);
			const checkBalanceSpy = jest.spyOn(shared, "checkBalance");
			const approveSpy = jest.spyOn(shared, "approve");
			const executeSpy = jest.spyOn(shared, "executeWithResponse");

			const result = await recover.recoverNFT(tokenId, amount);
			expect(checkBalanceSpy).toHaveBeenCalledTimes(4);
			expect(baseCharacteristicsSpy).toHaveBeenCalled();
			expect(calculateBaseTokensAmountsSpy).toHaveBeenCalled();
			expect(approveSpy).toHaveBeenCalledTimes(4);
			expect(executeSpy).toHaveBeenCalledWith(
				txPromise,
				{
					name: BaseTokenManager_ABI.contractName,
					address: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS,
					contractFunction: "recover"
				},
				recover.extractInfoFromEvent
			);
			expect(recoverSpy).toHaveBeenCalledWith(tokenId, amount);
			expect(result).toMatchObject({
				to: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS,
				from: "0x123",
				contractAddress: BASE_TOKEN_MANAGER_CONTRACT_ADDRESS
			});
		});
	});

	describe("extractInfoFromEvent", () => {
		it("should return undefined id, amount and msgSender if no events passed", () => {
			const result = recover.extractInfoFromEvent();
			expect(result.id).toBeUndefined();
			expect(result.amount).toBeUndefined();
			expect(result.msgSender).toBeUndefined();
		});

		it("should return undefined id, amount and msgSender if no Recover event passed", () => {
			const result = recover.extractInfoFromEvent();
			expect(result.id).toBeUndefined();
			expect(result.amount).toBeUndefined();
			expect(result.msgSender).toBeUndefined();
		});

		it("should return undefined id, amount and msgSender if no args in event", () => {
			const event: Partial<Event> = {
				event: Events.recover
			};
			const result = recover.extractInfoFromEvent([event as Event]);
			expect(result.id).toBeUndefined();
			expect(result.amount).toBeUndefined();
			expect(result.msgSender).toBeUndefined();
		});

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		it("should extract id, amount and msgSender from event", () => {
			const id = "1";
			const amount = "1000";
			const msgSender = "0x123";
			const event: Partial<Event> = {
				event: Events.recover,
				args: { id, amount, msgSender } as any
			};
			const result = recover.extractInfoFromEvent([event as Event]);
			expect(result.id).toBe("1");
			expect(result.amount).toBe("1000");
			expect(result.msgSender).toBe("0x123");
		});
	});
});
