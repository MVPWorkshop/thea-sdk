import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { InfuraProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
	castAbiInterface,
	consts,
	getAddress,
	getCurrentNBTTokenAddress,
	getERC20ContractAddress,
	isSigner,
	isTypedDataSigner,
	signerRequired,
	TheaError,
	TheaNetwork,
	tokenAmountShouldBeTon,
	typedDataSignerRequired,
	validateAddress
} from "../../src";

import { ABI, CONTRACT_ADDRESS, PRIVATE_KEY, WALLET_ADDRESS } from "../mocks";

jest.mock("@ethersproject/contracts", () => {
	return {
		Contract: jest.fn().mockReturnValue({
			baseCharacteristics: jest.fn().mockReturnValue({ vintage: BigNumber.from(1) }),
			baseTokens: jest.fn().mockReturnValue("0x0001")
		})
	};
});
describe("Utils", () => {
	it("should cast contract ABI as ContractInterface", () => {
		const result = castAbiInterface(ABI);
		expect(typeof result === "string" || typeof result === "object").toBeTruthy();
	});

	describe("validateAddress", () => {
		it("should throw error if address is invalid", () => {
			expect(() => {
				validateAddress("0x123");
			}).toThrow(
				new TheaError({
					type: "INVALID_ADDRESS",
					message: "Passed address is not valid ethereum address"
				})
			);
		});

		it("should return address in lowercase", () => {
			const result = validateAddress(WALLET_ADDRESS);
			expect(result).toBe(WALLET_ADDRESS.toLowerCase());
		});
	});

	describe("isSigner", () => {
		it("should return true if providerOrSigner is Signer", () => {
			const signer = new Wallet(PRIVATE_KEY);
			expect(isSigner(signer)).toBe(true);
		});

		it("should return false if providerOrSigner is not Signer", () => {
			const provider = new InfuraProvider();
			expect(isSigner(provider)).toBe(false);
		});
	});

	describe("signerRequired", () => {
		it("should throw error if providerOrSigner is not Signer", () => {
			expect(() => signerRequired(new InfuraProvider())).toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});

		it("should execute void function without error if providerOrSigner is Signer", () => {
			expect(() => {
				signerRequired(new Wallet(PRIVATE_KEY));
			}).not.toThrow();
		});
	});
	describe("isTypedDataSigner", () => {
		it("should return true if providerOrSigner is TypedDataSigner", () => {
			const signer = new Wallet(PRIVATE_KEY);
			expect(isTypedDataSigner(signer)).toBe(true);
		});

		it("should return false if providerOrSigner is not TypedDataSigner", () => {
			const provider = new InfuraProvider();
			expect(isTypedDataSigner(provider)).toBe(false);
		});
	});

	describe("typedDataSignerRequired", () => {
		it("should throw error if providerOrSigner is not TypedDataSigner", () => {
			expect(() => typedDataSignerRequired(new InfuraProvider())).toThrow(
				new TheaError({
					type: "TYPED_DATA_SIGNER_REQUIRED",
					message:
						"TypedDataSigner is required for this operation. You must pass in a TypedDataSigner(Wallet) on SDK initialization"
				})
			);
		});

		it("should execute void function without error if providerOrSigner is TypedDataSigner", () => {
			expect(() => {
				typedDataSignerRequired(new Wallet(PRIVATE_KEY));
			}).not.toThrow();
		});
	});

	describe("getERC20ContractAddress", () => {
		const network = TheaNetwork.GANACHE;
		it("should return sdg token contract address if token is SDG", () => {
			const result = getERC20ContractAddress("SDG", TheaNetwork.GANACHE);
			expect(result).toBe(consts[`${network}`].sdgTokenContract);
		});

		it("should return vintage token contract address if token is Vintage", () => {
			const result = getERC20ContractAddress("Vintage", TheaNetwork.GANACHE);
			expect(result).toBe(consts[`${network}`].vintageTokenContract);
		});

		it("should return rating token contract address if token is Rating", () => {
			const result = getERC20ContractAddress("Rating", TheaNetwork.GANACHE);
			expect(result).toBe(consts[`${network}`].ratingTokenContract);
		});

		it("should return current nbt token contract address if token is CurrentNBT", () => {
			const result = getERC20ContractAddress("CurrentNBT", TheaNetwork.GANACHE);
			expect(result).toBe(consts[`${network}`].currentNbtTokenContract);
		});

		it("should return stable token contract address if token is Stable", () => {
			const result = getERC20ContractAddress("Stable", TheaNetwork.GANACHE);
			expect(result).toBe(consts[`${network}`].stableTokenContract);
		});
	});

	describe("getCurrentNBTTokenAddress", () => {
		it("should return current NBT token address", async () => {
			const providerOrSigner = new Wallet(PRIVATE_KEY);
			const contract = new Contract(CONTRACT_ADDRESS, ABI, providerOrSigner);
			const baseTokensSpy = jest.spyOn(contract, "baseTokens");
			const baseCharacteristicsSpy = jest.spyOn(contract, "baseCharacteristics");
			const result = await getCurrentNBTTokenAddress(TheaNetwork.GANACHE, providerOrSigner);
			expect(result).toBe("0x0001");
			expect(baseCharacteristicsSpy).toBeCalled();
			expect(baseTokensSpy).toBeCalledWith(BigNumber.from(1));
		});
	});

	describe("getAddress", () => {
		it("should return address of signer", async () => {
			const signer = new Wallet(PRIVATE_KEY);
			const result = await getAddress(signer as Signer);
			expect(result).toBe("0xE63CCe5bEBF27CFa751de8A1550692d3B12b7B7a");
		});
	});

	describe("tokenAmountShouldBeTon", () => {
		it("should throw error if amount is not ton", () => {
			expect(() => {
				tokenAmountShouldBeTon(100);
			}).toThrow(
				new TheaError({
					type: "INVALID_TOKEN_AMOUNT_VALUE",
					message: "Amount should be a ton. Value must be greater than 0 and divisible by 1000"
				})
			);
		});

		it("should not throw error if amount is ton", () => {
			expect(() => {
				tokenAmountShouldBeTon(1000);
			}).not.toThrow();
		});
	});
});
