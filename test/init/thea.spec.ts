import {
	Convert,
	FungibleTrading,
	GetCharacteristicsBytes,
	GetTokenList,
	NFTTrading,
	Offset,
	Orderbook,
	Recover,
	RollBaseTokens,
	TheaNetwork,
	TheaSDK,
	Unwrap
} from "../../src";
import { consts, TheaError } from "../../src/utils";
import { ExternalProvider, InfuraProvider, Provider, Web3Provider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { PRIVATE_KEY } from "../mocks";
import * as utils from "../../src/utils/utils";
jest.mock("../../src/modules/");
jest.mock("../../src/utils/utils", () => {
	return {
		getCurrentNBTTokenAddress: jest.fn().mockResolvedValue("0x5FbDB2315678afecb367f032d93F642f64180aa3")
	};
});
jest.mock("@ethersproject/providers", () => {
	return {
		Web3Provider: jest.fn().mockImplementation(() => {
			return {
				getSigner: jest.fn().mockImplementation(() => {
					return {};
				})
			};
		}),
		InfuraProvider: jest.fn().mockImplementation(() => {
			const value = { _isProvider: true };
			return value as Provider;
		})
	};
});

describe("TheaSDK", () => {
	describe("Invalid params", () => {
		it("should throw error if non of optional parameters were passed", async () => {
			await expect(TheaSDK.init({ network: TheaNetwork.MUMBAI })).rejects.toThrow(
				new TheaError({ type: "EMPTY_OPTIONS", message: "Non of optional parameters were provided" })
			);
		});

		it("should throw error if provider is not passed with private key", async () => {
			await expect(TheaSDK.init({ network: TheaNetwork.MUMBAI, privateKey: "0x123" })).rejects.toThrow(
				new TheaError({ type: "MISSING_PROVIDER", message: "You must pass in a provider together with private key" })
			);
		});
	});

	describe("Valid Params", () => {
		it("should instantiate TheaSDK class dependencies", async () => {
			await TheaSDK.init({
				network: TheaNetwork.MUMBAI,
				privateKey: PRIVATE_KEY,
				provider: new InfuraProvider()
			});

			expect(Unwrap).toHaveBeenCalledTimes(1);
			expect(Offset).toHaveBeenCalledTimes(1);
		});
		it("should return TheaSDK instance using web3Provider", async () => {
			const web3Provider = new Web3Provider({} as ExternalProvider);
			const getSignerSpy = jest.spyOn(web3Provider, "getSigner");
			const currentNbtSpy = jest.spyOn(utils, "getCurrentNBTTokenAddress");
			const result = await TheaSDK.init({
				network: TheaNetwork.MUMBAI,
				web3Provider
			});

			expect(result).toBeInstanceOf(TheaSDK);
			expect(result.network).toBe(TheaNetwork.MUMBAI);
			expect(result.providerOrSigner).toBeDefined();
			expect(getSignerSpy).toHaveBeenCalled();
			expect(Unwrap).toBeCalled();
			expect(Convert).toBeCalled();
			expect(Recover).toBeCalled();
			expect(FungibleTrading).toBeCalled();
			expect(GetCharacteristicsBytes).toBeCalled();
			expect(Orderbook).toBeCalled();
			expect(NFTTrading).toBeCalled();
			expect(GetTokenList).toBeCalled();
			expect(RollBaseTokens).toBeCalled();
			expect(currentNbtSpy).toBeCalled();
			expect(consts[TheaNetwork.MUMBAI].currentNbtTokenContract).toBe("0x5FbDB2315678afecb367f032d93F642f64180aa3");
		});

		it("should return TheaSDK instance using signer", async () => {
			const signer = new Wallet(PRIVATE_KEY);
			const result = await TheaSDK.init({
				network: TheaNetwork.MUMBAI,
				signer
			});

			expect(result).toBeInstanceOf(TheaSDK);
			expect(result.network).toBe(TheaNetwork.MUMBAI);
			expect(result.providerOrSigner).toBeInstanceOf(Wallet);
		});

		it("should return TheaSDK instance using private key", async () => {
			const result = await TheaSDK.init({
				network: TheaNetwork.MUMBAI,
				privateKey: PRIVATE_KEY,
				provider: new InfuraProvider()
			});

			expect(result).toBeInstanceOf(TheaSDK);
			expect(result.network).toBe(TheaNetwork.MUMBAI);
			expect(result.providerOrSigner).toBeInstanceOf(Wallet);
		});

		it("should return TheaSDK instance using provider", async () => {
			const result = await TheaSDK.init({
				network: TheaNetwork.MUMBAI,
				provider: new InfuraProvider()
			});

			expect(result).toBeInstanceOf(TheaSDK);
			expect(result.network).toBe(TheaNetwork.MUMBAI);
			expect(result.providerOrSigner).toBeDefined();
		});
	});
});
