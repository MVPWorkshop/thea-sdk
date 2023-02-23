import { ContractTransaction, Event } from "@ethersproject/contracts";
import { Wallet } from "@ethersproject/wallet";
import { consts, Events, IRegistryContract, Offset, TheaError, TheaNetwork } from "../../src";
import { CONTRACT_ADDRESS, PRIVATE_KEY } from "../mocks";
import * as utils from "../../src/utils/utils";
import * as shared from "../../src/modules/shared";
import { JsonRpcProvider } from "@ethersproject/providers";
import Registry_ABI from "../../src/abi/Registry_ABI.json";

jest.mock("@ethersproject/contracts", () => {
	return {
		Contract: jest.fn().mockReturnValue({
			retire: jest.fn().mockReturnValue(
				Promise.resolve({
					wait: jest.fn().mockResolvedValue({
						to: "0x686AfD6e502A81D2e77f2e038A23C0dEf4949A20",
						from: "0x123",
						contractAddress: "0x686AfD6e502A81D2e77f2e038A23C0dEf4949A20"
					})
				})
			),
			requestRetireFungible: jest.fn().mockReturnValue({
				wait: jest.fn().mockResolvedValue({
					to: "0x686AfD6e502A81D2e77f2e038A23C0dEf4949A20",
					from: "0x123",
					contractAddress: "0x686AfD6e502A81D2e77f2e038A23C0dEf4949A20"
				})
			}),
			baseTokens: jest.fn().mockImplementation((...args) => {
				if (args[0] === 2017) return CONTRACT_ADDRESS;
				else return "0x0000000000000000000000000000000000000000";
			})
		})
	};
});

jest.mock("../../src/modules/shared", () => {
	return {
		checkBalance: jest.fn(),
		approve: jest.fn(),
		execute: jest.fn().mockImplementation(() => {
			return {
				to: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
				from: "0x123",
				contractAddress: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1"
			};
		}),
		executeWithResponse: jest.fn().mockImplementation(() => {
			return {
				to: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
				from: "0x123",
				contractAddress: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
				requestId: "1"
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

describe("Offset", () => {
	const signer = new Wallet(PRIVATE_KEY, new JsonRpcProvider());
	const network = TheaNetwork.GANACHE;
	const contractAddress = consts[`${network}`].registryContract;
	const contractTransaction: Partial<ContractTransaction> = {
		wait: jest.fn().mockResolvedValue({
			to: contractAddress,
			from: "0x123",
			contractAddress: contractAddress
		})
	};
	const txPromise = Promise.resolve(contractTransaction as ContractTransaction);

	const tokenId = "1";
	const amount = "1000";
	const vintage = 2017;
	let offSet: Offset;

	const mockContract: Partial<IRegistryContract> = {
		retire: jest.fn().mockReturnValue(txPromise),
		requestRetireFungible: jest.fn().mockReturnValue(contractTransaction as ContractTransaction)
	};

	beforeEach(() => {
		offSet = new Offset(signer, network);
		offSet.contract = mockContract as IRegistryContract;
	});

	describe("offsetNft", () => {
		it("should offset nft", async () => {
			const retireSpy = jest.spyOn(offSet.contract, "retire");
			const signerRequiredSpy = jest.spyOn(utils, "signerRequired");
			const executeSpy = jest.spyOn(shared, "execute");
			const checkBalance = jest.spyOn(shared, "checkBalance");
			const approveSpy = jest.spyOn(shared, "approve");

			await offSet.offsetNFT(tokenId, amount);

			expect(signerRequiredSpy).toHaveBeenCalledWith(signer);
			expect(checkBalance).toHaveBeenCalledWith(signer, network, { token: "ERC1155", tokenId, amount });
			expect(approveSpy).toHaveBeenCalledWith(signer, network, {
				token: "ERC1155",
				spender: contractAddress
			});
			expect(retireSpy).toHaveBeenCalledWith(tokenId, amount);
			expect(executeSpy).toHaveBeenCalledWith(txPromise, {
				name: Registry_ABI.contractName,
				address: contractAddress,
				contractFunction: "retire"
			});
		});
	});

	describe("offsetFungible", () => {
		it("should offset fungible", async () => {
			const retireFungibleSpy = jest.spyOn(offSet.contract, "requestRetireFungible");
			const executeSpy = jest.spyOn(shared, "executeWithResponse");

			const result = await offSet.offsetFungible(vintage, amount);
			expect(retireFungibleSpy).toBeCalledWith(vintage, amount);
			expect(executeSpy).toHaveBeenCalled();
			expect(result.requestId).toBe("1");
		});

		it("should throw error if token address is not found for vintage", async () => {
			await expect(offSet.offsetFungible(2011, amount)).rejects.toThrow(
				new TheaError({ type: "TOKEN_NOT_FOUND", message: `Token by 2011 vintage not found` })
			);
		});
	});

	describe("extractRequestIdFromEvent", () => {
		it("should return undefined request id if no events passed", () => {
			const result = offSet.extractRequestIdFromEvent();
			expect(result.requestId).toBeUndefined();
		});

		it("should return undefined request id if no Unwrap event passed", () => {
			const result = offSet.extractRequestIdFromEvent([]);
			expect(result.requestId).toBeUndefined();
		});

		it("should return undefined request id if args in event", () => {
			const event: Partial<Event> = {
				event: Events.retireOffset
			};
			const result = offSet.extractRequestIdFromEvent([event as Event]);
			expect(result.requestId).toBeUndefined();
		});

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		it("should extract request id from event", () => {
			const requestId = "1";
			const event: Partial<Event> = {
				event: Events.retireOffset,
				args: { requestId } as any
			};
			const result = offSet.extractRequestIdFromEvent([event as Event]);
			expect(result.requestId).toBe("1");
		});
	});
});
