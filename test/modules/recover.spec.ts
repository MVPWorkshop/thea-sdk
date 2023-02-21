import { BigNumber } from "@ethersproject/bignumber";
import { ContractTransaction, Event } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
	Events,
	TheaError,
	Recover,
	IBaseTokenManagerContract,
	BaseTokenCharactaristics,
	GetCharacteristicsBytes,
	TheaNetwork,
	consts
} from "../../src";
import { PRIVATE_KEY } from "../mocks";
import * as shared from "../../src/modules/shared";
import BaseTokenManager_ABI from "../../src/abi/BaseTokenManager_ABI.json";
import { formatBytes32String } from "@ethersproject/strings";

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
			to: baseTokenManagerContractAddress,
			from: "0x123",
			contractAddress: baseTokenManagerContractAddress
		})
	};

	const baseTokenCharacteristicsTransaction: Partial<BaseTokenCharactaristics> = {
		vintage: BigNumber.from(2022),
		sdgsCount: BigNumber.from(1),
		rating: BigNumber.from(5)
	};

	const calculateBaseTokensAmountsTransaction: Partial<{
		cbt: BigNumber;
		sdg: BigNumber;
		vintage: BigNumber;
		rating: BigNumber;
	}> = {
		vintage: BigNumber.from(2022),
		sdg: BigNumber.from(1),
		rating: BigNumber.from(5),
		cbt: BigNumber.from(2020)
	};

	const getFeatureValueTransaction: Partial<{ vintageValue: BigNumber; sdgValue: BigNumber; ratingValue: BigNumber }> =
		{
			vintageValue: BigNumber.from(2021),
			sdgValue: BigNumber.from(2),
			ratingValue: BigNumber.from(5)
		};
	const getCharacteristicsBytesTransaction =
		"0x00000000000000000000000000000000000000000000000000000000000007e3000000000000000000000000000000000000000000000000000000000000000f0000000000000000000000000000000000000000000000000000000000000002";

	const mockContract: Partial<IBaseTokenManagerContract> = {
		recover: jest.fn().mockResolvedValue(contractTransaction as ContractTransaction),
		baseCharacteristics: jest.fn().mockResolvedValue(baseTokenCharacteristicsTransaction as ContractTransaction)
	};

	const network = TheaNetwork.GANACHE;

	beforeEach(() => {
		const registry = new GetCharacteristicsBytes(providerOrSigner, network);
		recover = new Recover(providerOrSigner, network, registry);
		recover.contract = mockContract as IBaseTokenManagerContract;
	});

	describe("recoverNFT", () => {
		it("should throw error that signer is required", async () => {
			const registry = new GetCharacteristicsBytes(providerOrSigner, network);
			recover = new Recover(new JsonRpcProvider(), network, registry);
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
					cbt: BigNumber;
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
					address: baseTokenManagerContractAddress,
					contractFunction: "recover"
				},
				recover.extractInfoFromEvent
			);
			expect(recoverSpy).toHaveBeenCalledWith(tokenId, amount);
			expect(result).toMatchObject({
				to: baseTokenManagerContractAddress,
				from: "0x123",
				contractAddress: baseTokenManagerContractAddress
			});
		});
	});

	describe("extractInfoFromEvent", () => {
		it("should return undefined id, amount and msgSender if no events passed", () => {
			const result = recover.extractInfoFromEvent();
			expect(result.id).toBeUndefined();
			expect(result.amount).toBeUndefined();
		});

		it("should return undefined id, amount and msgSender if no Recover event passed", () => {
			const result = recover.extractInfoFromEvent();
			expect(result.id).toBeUndefined();
			expect(result.amount).toBeUndefined();
		});

		it("should return undefined id, amount and msgSender if no args in event", () => {
			const event: Partial<Event> = {
				event: Events.recover
			};
			const result = recover.extractInfoFromEvent([event as Event]);
			expect(result.id).toBeUndefined();
			expect(result.amount).toBeUndefined();
		});

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		it("should extract id, amount and msgSender from event", () => {
			const tokenId = "1";
			const amount = "1000";
			const event: Partial<Event> = {
				event: Events.recover,
				args: { tokenId, amount } as any
			};
			const result = recover.extractInfoFromEvent([event as Event]);
			expect(result.id).toBe("1");
			expect(result.amount).toBe("1000");
		});
	});

	describe("calculateBaseTokensAmounts", () => {
		it("should return btVintage, sdg, vintage and rating amounts", async () => {
			const id = "1";
			const amount = "1000";
			const unitAmount = BigNumber.from(amount).mul(10);
			const baseCharacteristics = {
				vintage: BigNumber.from(2020),
				sdgsCount: BigNumber.from(1),
				rating: BigNumber.from(4)
			};

			const getFeatureValueTxPromise = Promise.resolve(
				getFeatureValueTransaction as { vintageValue: BigNumber; sdgValue: BigNumber; ratingValue: BigNumber }
			);
			const getFeatureValueSpy = jest.spyOn(recover, "getFeatureValue").mockReturnValue(getFeatureValueTxPromise);
			const result = await recover.calculateBaseTokensAmounts(id, amount, baseCharacteristics);

			expect(getFeatureValueSpy).toHaveBeenCalledWith(id);
			expect(result.cbt).toEqual(unitAmount);
			expect(result.sdg).toEqual(unitAmount);
			expect(result.vintage).toEqual(unitAmount);
			expect(result.rating).toEqual(unitAmount);
		});
	});

	describe("queryRecoverFungibles", () => {
		it("should return btVintage, sdg, vintage and rating amounts", async () => {
			const tokenId = "1";
			const amount = "1000";
			const baseCharacteristicsTxPromise = Promise.resolve(
				baseTokenCharacteristicsTransaction as BaseTokenCharactaristics
			);
			const baseCharacteristicsSpy = jest
				.spyOn(recover.contract, "baseCharacteristics")
				.mockReturnValue(baseCharacteristicsTxPromise);

			const calculateBaseTokensAmountsTxPromise = Promise.resolve(
				calculateBaseTokensAmountsTransaction as {
					cbt: BigNumber;
					sdg: BigNumber;
					vintage: BigNumber;
					rating: BigNumber;
				}
			);
			const calculateBaseTokensAmountsSpy = jest
				.spyOn(recover, "calculateBaseTokensAmounts")
				.mockReturnValue(calculateBaseTokensAmountsTxPromise);
			const result = await recover.queryRecoverFungibles(tokenId, amount);

			expect(baseCharacteristicsSpy).toHaveBeenCalled();
			expect(calculateBaseTokensAmountsSpy).toHaveBeenCalled();
			expect(result.cbt).toEqual(calculateBaseTokensAmountsTransaction.cbt?.toString());
			expect(result.sdg).toEqual(calculateBaseTokensAmountsTransaction.sdg?.toString());
			expect(result.vintage).toEqual(calculateBaseTokensAmountsTransaction.vintage?.toString());
			expect(result.rating).toEqual(calculateBaseTokensAmountsTransaction.rating?.toString());
		});
	});

	describe("getFeatureValue", () => {
		it("should return sdgValue, vintageValue and ratingValue", async () => {
			const id = "1";
			const keys = [formatBytes32String("vintage"), formatBytes32String("sdgs_count"), formatBytes32String("rating")];
			const decodedValues = [BigNumber.from(2019), BigNumber.from(15), BigNumber.from(2)];

			const getCharacteristicsBytesTxPromise = Promise.resolve(getCharacteristicsBytesTransaction as string);
			const getCharacteristicsBytesTxSpy = jest
				.spyOn(recover.registry, "getCharacteristicsBytes")
				.mockReturnValue(getCharacteristicsBytesTxPromise);
			const result = await recover.getFeatureValue(id);

			expect(getCharacteristicsBytesTxSpy).toHaveBeenCalledWith(id, keys);
			expect(result.vintageValue).toEqual(decodedValues[0]);
			expect(result.sdgValue).toEqual(decodedValues[1]);
			expect(result.ratingValue).toEqual(decodedValues[2]);
		});
	});
});
