import {
	Convert,
	FungibleTrading,
	GetCharacteristicsBytes,
	GetTokenList,
	NFTTrading,
	Orderbook,
	Recover,
	TheaNetwork,
	TheaSDK,
	Unwrap
} from "../../src";
import { TheaError } from "../../src/utils";
import { ExternalProvider, InfuraProvider, Provider, Web3Provider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { PRIVATE_KEY } from "../mocks";

jest.mock("../../src/modules/");
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
		it("should throw error if non of optional parameters were passed", () => {
			expect(() => TheaSDK.init({ network: TheaNetwork.GANACHE })).toThrow(
				new TheaError({ type: "EMPTY_OPTIONS", message: "Non of optional parameters were provided" })
			);
		});

		it("should throw error if provider is not passed with private key", () => {
			expect(() => TheaSDK.init({ network: TheaNetwork.GANACHE, privateKey: "0x123" })).toThrow(
				new TheaError({ type: "MISSING_PROVIDER", message: "You must pass in a provider together with private key" })
			);
		});
	});

	describe("Valid Params", () => {
		it("should instantiate TheaSDK class dependencies", () => {
			TheaSDK.init({
				network: TheaNetwork.GANACHE,
				privateKey: PRIVATE_KEY,
				provider: new InfuraProvider()
			});

			expect(Unwrap).toHaveBeenCalledTimes(1);
		});
		it("should return TheaSDK instance using web3Provider", () => {
			const web3Provider = new Web3Provider({} as ExternalProvider);
			const getSignerSpy = jest.spyOn(web3Provider, "getSigner");
			const result = TheaSDK.init({
				network: TheaNetwork.GANACHE,
				web3Provider
			});

			expect(result).toBeInstanceOf(TheaSDK);
			expect(result.network).toBe(TheaNetwork.GANACHE);
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
		});

		it("should return TheaSDK instance using signer", () => {
			const signer = new Wallet(PRIVATE_KEY);
			const result = TheaSDK.init({
				network: TheaNetwork.GANACHE,
				signer
			});

			expect(result).toBeInstanceOf(TheaSDK);
			expect(result.network).toBe(TheaNetwork.GANACHE);
			expect(result.providerOrSigner).toBeInstanceOf(Wallet);
		});

		it("should return TheaSDK instance using private key", () => {
			const result = TheaSDK.init({
				network: TheaNetwork.GANACHE,
				privateKey: PRIVATE_KEY,
				provider: new InfuraProvider()
			});

			expect(result).toBeInstanceOf(TheaSDK);
			expect(result.network).toBe(TheaNetwork.GANACHE);
			expect(result.providerOrSigner).toBeInstanceOf(Wallet);
		});

		it("should return TheaSDK instance using provider", () => {
			const result = TheaSDK.init({
				network: TheaNetwork.GANACHE,
				provider: new InfuraProvider()
			});

			expect(result).toBeInstanceOf(TheaSDK);
			expect(result.network).toBe(TheaNetwork.GANACHE);
			expect(result.providerOrSigner).toBeDefined();
		});
	});
});
