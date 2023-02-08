import {
	CarbonInfo,
	Convert,
	FungibleTrading,
	GetCharacteristicsBytes,
	GetTokenList,
	NFTTrading,
	Offset,
	Orderbook,
	Recover,
	TheaNetwork,
	TheaSDK,
	Unwrap
} from "../../src";
import { consts, TheaError } from "../../src/utils";
import { ExternalProvider, InfuraProvider, Network, Provider, Web3Provider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { CONTRACT_ADDRESS, PRIVATE_KEY } from "../mocks";
import { Signer } from "@ethersproject/abstract-signer";
jest.mock("../../src/modules/");
/* eslint-disable  @typescript-eslint/no-explicit-any */
jest.mock("../../src/utils/utils", () => {
	return {
		getCurrentNBTTokenAddress: jest.fn().mockResolvedValue("0x5FbDB2315678afecb367f032d93F642f64180aa3"),
		isSigner(providerOrSigner: any): providerOrSigner is Signer {
			return !!providerOrSigner._isSigner;
		},
		isProvider(providerOrSigner: any): providerOrSigner is Provider {
			return !!providerOrSigner._isProvider;
		},
		validateAddress: () => "0x5FbDB2315678afecb367f032d93F642f64180aa3".toLowerCase()
	};
});
jest.mock("@ethersproject/providers", () => {
	return {
		Web3Provider: jest.fn().mockImplementation(() => {
			return {
				getSigner: jest.fn().mockImplementation(() => {
					return {
						_isSigner: true,
						getChainId: (): Promise<number> => {
							return Promise.resolve(80001);
						}
					};
				})
			};
		}),
		InfuraProvider: jest.fn().mockImplementation((args) => {
			const value = {
				_isProvider: true,
				getNetwork: (): Promise<Network> => {
					return Promise.resolve({ chainId: args ?? 80001, name: "Mumbai" });
				}
			};
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
			expect(CarbonInfo).toBeCalled();
		});

		it("should throw error if signer doesn't have provider specified", async () => {
			const signer = new Wallet(PRIVATE_KEY);
			await expect(
				TheaSDK.init({
					network: TheaNetwork.MUMBAI,
					signer
				})
			).rejects.toThrow(new TheaError({ type: "SIGNER_REQUIRES_PROVIDER", message: "Signer must be have provider" }));
		});
		it("should return TheaSDK instance using signer", async () => {
			const signer = new Wallet(PRIVATE_KEY, new InfuraProvider());
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

		it("should throw error if there is network mismatch between provider and network in init options", async () => {
			const provider = new InfuraProvider(1);
			const { chainId } = await provider.getNetwork();
			const options = {
				network: TheaNetwork.MUMBAI,
				provider
			};

			await expect(TheaSDK.init(options)).rejects.toThrow(
				new TheaError({
					type: "NETWORK_MISMATCH",
					message: `Provided network is ${options.network} but provider is connected to ${chainId} network`
				})
			);
		});
	});

	describe("setCurrentNBTContractAddress", () => {
		it("should set current NBT contract address", async () => {
			const theaSDK = await TheaSDK.init({
				network: TheaNetwork.MUMBAI,
				privateKey: PRIVATE_KEY,
				provider: new InfuraProvider()
			});

			theaSDK.setCurrentNBTContractAddress(CONTRACT_ADDRESS);

			expect(consts[`${TheaNetwork.MUMBAI}`].currentNbtTokenContract).toBe(CONTRACT_ADDRESS);
		});
	});
});
