import { ContractTransaction } from "@ethersproject/contracts";
import { Wallet } from "@ethersproject/wallet";
import { consts, IRegistryContract, Offset, TheaNetwork } from "../../src";
import { PRIVATE_KEY } from "../mocks";
import * as utils from "../../src/utils/utils";
import * as shared from "../../src/modules/shared";
import { JsonRpcProvider } from "@ethersproject/providers";
import Registry_ABI from "../../src/abi/Registry_ABI.json";

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
		})
	};
});

describe("Offset", () => {
	const signer = new Wallet(PRIVATE_KEY, new JsonRpcProvider());
	const network = TheaNetwork.GANACHE;
	const contractAddress = consts[`${network}`].registryContract;
	const contractTransaction: Partial<ContractTransaction> = {
		wait: jest.fn().mockResolvedValue(() => {
			return {
				to: contractAddress,
				from: "0x123",
				contractAddress: contractAddress
			};
		})
	};
	const txPromise = Promise.resolve(contractTransaction as ContractTransaction);

	const tokenId = "1";
	const amount = "1000";
	let offSet: Offset;

	const mockContract: Partial<IRegistryContract> = {
		retire: jest.fn().mockReturnValue(txPromise)
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
});
