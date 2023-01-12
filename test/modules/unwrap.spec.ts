import { BigNumber } from "@ethersproject/bignumber";
import { ContractTransaction, Event } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Events, IRegistryContract, REGISTRY_CONTRACT_ADDRESS, TheaError, Unwrap } from "../../src";
import { PRIVATE_KEY } from "../mocks";
import * as shared from "../../src/modules/shared";
import * as utils from "../../src/utils/utils";
import Registry_ABI from "../../src/abi/Registry_ABI.json";

jest.mock("../../src/modules/shared", () => {
	return {
		checkBalance: jest.fn(),
		approve: jest.fn(),
		executeWithResponse: jest.fn().mockImplementation(() => {
			return {
				to: REGISTRY_CONTRACT_ADDRESS,
				from: "0x123",
				contractAddress: REGISTRY_CONTRACT_ADDRESS,
				requestId: "1"
			};
		})
	};
});

describe("Unwrap", () => {
	const providerOrSigner = new Wallet(PRIVATE_KEY);
	let unwrap: Unwrap;
	const tokenId = "1";
	const amount = BigNumber.from(1000);
	const offchainAccount = "0x1234567890";

	const contractTransaction: Partial<ContractTransaction> = {
		wait: jest.fn().mockResolvedValue({
			to: REGISTRY_CONTRACT_ADDRESS,
			from: "0x123",
			contractAddress: REGISTRY_CONTRACT_ADDRESS
		})
	};

	const mockContract: Partial<IRegistryContract> = {
		unwrap: jest.fn().mockResolvedValue(contractTransaction as ContractTransaction),
		requests: jest.fn().mockResolvedValue({ status: 0, maker: "0x123", tokenId, amount })
	};

	beforeEach(() => {
		unwrap = new Unwrap(providerOrSigner);
		unwrap.contract = mockContract as IRegistryContract;
	});

	describe("unwrapToken", () => {
		it("should throw error that signer is required", async () => {
			unwrap = new Unwrap(new JsonRpcProvider());
			await expect(unwrap.unwrapToken(tokenId, amount, offchainAccount)).rejects.toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});

		it("should throw error if amount is not valid", async () => {
			await expect(unwrap.unwrapToken(tokenId, BigNumber.from(1001), offchainAccount)).rejects.toThrow(
				new TheaError({
					type: "INVALID_TOKEN_AMOUNT_VALUE",
					message: "Amount should be a ton. Value must be greater than 0 and divisible by 1000"
				})
			);
		});

		it("should call unwrap method from contract", async () => {
			const txPromise = Promise.resolve(contractTransaction as ContractTransaction);
			const unwrapSpy = jest.spyOn(unwrap.contract, "unwrap").mockReturnValue(txPromise);
			const checkBalanceSpy = jest.spyOn(shared, "checkBalance");
			const approveSpy = jest.spyOn(shared, "approve");
			const executeSpy = jest.spyOn(shared, "executeWithResponse");
			const tokenAmountShouldBeTonSpy = jest.spyOn(utils, "tokenAmountShouldBeTon");
			const result = await unwrap.unwrapToken(tokenId, amount, offchainAccount);

			expect(result.requestId).toBe("1");
			expect(checkBalanceSpy).toHaveBeenCalledWith(providerOrSigner, { token: "ERC1155", tokenId, amount });
			expect(approveSpy).toHaveBeenCalledWith(providerOrSigner, {
				token: "ERC1155",
				spender: REGISTRY_CONTRACT_ADDRESS
			});
			expect(executeSpy).toHaveBeenCalledWith(
				txPromise,
				{
					name: Registry_ABI.contractName,
					address: REGISTRY_CONTRACT_ADDRESS,
					contractFunction: "unwrap"
				},
				unwrap.extractRequestIdFromEvent
			);
			expect(unwrapSpy).toHaveBeenCalledWith(tokenId, amount, offchainAccount);
			expect(result).toMatchObject({
				to: REGISTRY_CONTRACT_ADDRESS,
				from: "0x123",
				contractAddress: REGISTRY_CONTRACT_ADDRESS
			});
			expect(tokenAmountShouldBeTonSpy).toHaveBeenCalledWith(amount);
		});
	});

	describe("extractRequestIdFromEvent", () => {
		it("should return undefined request id if no events passed", () => {
			const result = unwrap.extractRequestIdFromEvent();
			expect(result.requestId).toBeUndefined();
		});

		it("should return undefined request id if no Unwrap event passed", () => {
			const result = unwrap.extractRequestIdFromEvent([]);
			expect(result.requestId).toBeUndefined();
		});

		it("should return undefined request id if args in event", () => {
			const event: Partial<Event> = {
				event: Events.unwrap
			};
			const result = unwrap.extractRequestIdFromEvent([event as Event]);
			expect(result.requestId).toBeUndefined();
		});

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		it("should extract request id from event", () => {
			const requestId = "1";
			const event: Partial<Event> = {
				event: Events.unwrap,
				args: { requestId } as any
			};
			const result = unwrap.extractRequestIdFromEvent([event as Event]);
			expect(result.requestId).toBe("1");
		});
	});
	describe("getUnwrapTokenState", () => {
		it("should call requests mapping from contract", async () => {
			const requestsSpy = jest.spyOn(unwrap.contract, "requests");

			const result = await unwrap.getUnwrapTokenState(1);

			expect(result).toEqual({ status: 0, maker: "0x123", tokenId: tokenId.toString(), amount: amount.toString() });
			expect(requestsSpy).toHaveBeenCalledWith(1);
		});

		it("should throw error if tokenId is not valid", async () => {
			await expect(unwrap.getUnwrapTokenState(0)).rejects.toThrow(
				new TheaError({
					type: "INVALID_REQUEST_ID_VALUE",
					message: "Request id should be greater than 0"
				})
			);
		});
	});
});
