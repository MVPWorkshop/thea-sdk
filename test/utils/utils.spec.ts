import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { InfuraProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Token } from "@uniswap/sdk-core";
import { ChainId } from "@uniswap/smart-order-router";
import { TheaNetwork } from "../../src";
import {
	castAbiInterface,
	getERC20ContractAddress,
	isSigner,
	signerRequired,
	TheaError,
	validateAddress,
	consts,
	getCurrentNBTTokenAddress,
	isTypedDataSigner,
	typedDataSignerRequired,
	theaNetworkToChainId,
	getToken,
	ethToWei
} from "../../src/utils";
import { ABI, CONTRACT_ADDRESS, PRIVATE_KEY, WALLET_ADDRESS } from "../mocks";

jest.mock("@uniswap/smart-order-router", () => {
	return {
		ChainId: {
			GÖRLI: 5,
			POLYGON: 137,
			POLYGON_MUMBAI: 80001
		}
	};
});

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
		const network = TheaNetwork.GOERLI;
		consts[`${network}`].currentNbtTokenContract = CONTRACT_ADDRESS;

		it("should return contract address for token name", () => {
			expect(getERC20ContractAddress("SDG", network)).toBe(consts[`${network}`].sdgTokenContract);
			expect(getERC20ContractAddress("Vintage", network)).toBe(consts[`${network}`].vintageTokenContract);
			expect(getERC20ContractAddress("Rating", network)).toBe(consts[`${network}`].ratingTokenContract);
			expect(getERC20ContractAddress("CurrentNBT", network)).toBe(consts[`${network}`].currentNbtTokenContract);
			// TODO: Only to support test cases. Remove this after test cases are updated
			expect(getERC20ContractAddress("LINK", network)).toBe(consts[`${network}`].linkTokenContract);
			expect(getERC20ContractAddress("Stable", network)).toBe(consts[`${network}`].stableTokenContract);
		});
	});

	describe("getCurrentNBTTokenAddress", () => {
		it("should return current NBT token address", async () => {
			const providerOrSigner = new Wallet(PRIVATE_KEY);
			const contract = new Contract(CONTRACT_ADDRESS, ABI, providerOrSigner);
			const baseTokensSpy = jest.spyOn(contract, "baseTokens");
			const baseCharacteristicsSpy = jest.spyOn(contract, "baseCharacteristics");
			const result = await getCurrentNBTTokenAddress(TheaNetwork.GOERLI, providerOrSigner);
			expect(result).toBe("0x0001");
			expect(baseCharacteristicsSpy).toBeCalled();
			expect(baseTokensSpy).toBeCalledWith(BigNumber.from(1));
		});
	});
	describe("theaNetworkToChainId", () => {
		it("should return chain id for given network", () => {
			expect(theaNetworkToChainId(TheaNetwork.GOERLI)).toBe(ChainId.GÖRLI);
			expect(theaNetworkToChainId(TheaNetwork.POLYGON)).toBe(ChainId.POLYGON);
			expect(theaNetworkToChainId(TheaNetwork.MUMBAI)).toBe(ChainId.POLYGON_MUMBAI);
		});
	});

	describe("getToken", () => {
		const network = TheaNetwork.GOERLI;
		consts[`${network}`].currentNbtTokenContract = CONTRACT_ADDRESS;
		it("should return token class for TheaERC20Token", () => {
			expect(getToken(network, "SDG")).toEqual(
				new Token(5, consts[`${network}`].sdgTokenContract, 4, "SDG", "Thea SDG Token")
			);
			expect(getToken(network, "Vintage")).toEqual(
				new Token(5, consts[`${network}`].vintageTokenContract, 4, "VNT", "Thea Vintage Token")
			);
			expect(getToken(network, "LINK")).toEqual(
				new Token(5, consts[`${network}`].linkTokenContract, 18, "LINK", "Chainlink Token")
			);
			expect(getToken(network, "Rating")).toEqual(
				new Token(5, consts[`${network}`].ratingTokenContract, 4, "RTG", "Thea Rating Token")
			);
			expect(getToken(network, "CurrentNBT")).toEqual(
				new Token(5, consts[`${network}`].currentNbtTokenContract, 4, "NBT", "Thea Current NBT")
			);
			expect(getToken(network, "Stable")).toEqual(
				new Token(5, consts[`${network}`].stableTokenContract, 18, "DAI", "Dai Stablecoin")
			);
		});
	});

	describe("ethToWei", () => {
		it("should convert eth to wei", () => {
			expect(ethToWei("1")).toBe("1000000000000000000");
		});
	});
});
