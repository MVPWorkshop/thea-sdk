import { ContractReceipt, ContractTransaction } from "@ethersproject/contracts";
import { Wallet } from "@ethersproject/wallet";
import { IRegistryContract, Offset, REGISTRY_CONTRACT_ADDRESS } from "../../src";
import { PRIVATE_KEY, transaction } from "../mocks";
import * as utils from "../../src/utils/utils";
import * as shared from "../../src/modules/shared";
import { JsonRpcProvider } from "@ethersproject/providers";
import Registry_ABI from "../../src/abi/Registry_ABI.json";

jest.mock("../../src/modules/shared", () => {
	return {
		checkBalance: jest.fn(),
		approve: jest.fn(),
		execute: jest.fn().mockImplementation(() => {
			return transaction(REGISTRY_CONTRACT_ADDRESS) as ContractReceipt;
		})
	};
});

describe("Offset", () => {
	const signer = new Wallet(PRIVATE_KEY, new JsonRpcProvider());
	const tx = transaction(REGISTRY_CONTRACT_ADDRESS);
	const contractTransaction: Partial<ContractTransaction> = {
		wait: () => Promise.resolve(tx as ContractReceipt)
	};
	const txPromise = Promise.resolve(contractTransaction as ContractTransaction);

	const tokenId = "1";
	const amount = "1000";
	let offSet: Offset;

	const mockContract: Partial<IRegistryContract> = {
		retire: jest.fn().mockReturnValue(txPromise)
	};

	beforeEach(() => {
		offSet = new Offset(signer);
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
			expect(checkBalance).toHaveBeenCalledWith(signer, { token: "ERC1155", tokenId, amount });
			expect(approveSpy).toHaveBeenCalledWith(signer, {
				token: "ERC1155",
				spender: REGISTRY_CONTRACT_ADDRESS
			});
			expect(retireSpy).toHaveBeenCalledWith(tokenId, amount);
			expect(executeSpy).toHaveBeenCalledWith(txPromise, {
				name: Registry_ABI.contractName,
				address: REGISTRY_CONTRACT_ADDRESS,
				contractFunction: "retire"
			});
		});
	});
});
