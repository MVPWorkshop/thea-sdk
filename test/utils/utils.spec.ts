import { InfuraProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
	castAbiInterface,
	getERC20ContractAddress,
	isSigner,
	RATING_TOKEN_CONTRACT_ADDRESS,
	SDG_TOKEN_CONTRACT_ADDRESS,
	signerRequired,
	TheaError,
	tokenAmountShouldBeTon,
	validateAddress,
	VINTAGE_TOKEN_CONTRACT_ADDRESS
} from "../../src/utils";
import { ABI, PRIVATE_KEY, WALLET_ADDRESS } from "../mocks";

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

	describe("getERC20ContractAddress", () => {
		it("should return SDG_TOKEN_CONTRACT_ADDRESS if token is SDG", () => {
			const result = getERC20ContractAddress("SDG");
			expect(result).toBe(SDG_TOKEN_CONTRACT_ADDRESS);
		});

		it("should return VINTAGE_TOKEN_CONTRACT_ADDRESS if token is Vintage", () => {
			const result = getERC20ContractAddress("Vintage");
			expect(result).toBe(VINTAGE_TOKEN_CONTRACT_ADDRESS);
		});

		it("should return RATING_TOKEN_CONTRACT_ADDRESS if token is Rating", () => {
			const result = getERC20ContractAddress("Rating");
			expect(result).toBe(RATING_TOKEN_CONTRACT_ADDRESS);
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
