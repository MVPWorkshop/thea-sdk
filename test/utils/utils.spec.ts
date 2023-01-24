import { InfuraProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { TheaNetwork } from "../../src";
import {
	castAbiInterface,
	getERC20ContractAddress,
	getBaseTokenERC20ContractAddress,
	isSigner,
	signerRequired,
	TheaError,
	validateAddress,
	consts
} from "../../src/utils";
import { ABI, PRIVATE_KEY, WALLET_ADDRESS } from "../mocks";

jest.mock("@ethersproject/contracts", () => {
	return {
		Contract: jest.fn().mockImplementation(() => {
			return {
				baseTokens: jest.fn().mockReturnValue("0x0001")
			};
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

		// TODO: Only to support test cases. Remove this after test cases are updated
		it("should return link token contract address if token is Rating", () => {
			const result = getERC20ContractAddress("LINK", TheaNetwork.GANACHE);
			expect(result).toBe(consts[`${network}`].linkTokenContract);
		});
	});

	describe("getBaseTokenERC20ContractAddress", () => {
		it("should return base token address by id", async () => {
			const providerOrSigner = new Wallet(PRIVATE_KEY);
			const result = await getBaseTokenERC20ContractAddress(
				1,
				providerOrSigner,
				consts[TheaNetwork.GANACHE].baseTokenManagerContract
			);
			expect(result).toBe("0x0001");
		});
	});
});
