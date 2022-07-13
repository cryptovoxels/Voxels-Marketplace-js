import { constants, ethers, providers, utils } from "ethers";
import { keccak256 } from "ethers/lib/utils";
import {
  CONTRACTS,
  ERC1155_INTERFACE_ID,
  ERC721_INTERFACE_ID,
} from "./constants";
import { Approval, SupportsInterface, WrapperRegistry } from "./contracts";
import type { Marketplacev1 } from "./contracts/Marketplacev1";
import {
  address,
  ContractsByNetwork,
  ListingParams,
  Network,
  ProviderOrSigner,
} from "./types";
const approvalContractABI = require("../abis/approval.json");
const wrapperRegistryABI = require("../abis/wrapperRegistry.json");
const supportsInterfaceABI = require("../abis/supportsInterface.json");

type txError = {
  hash?: string;
  reason?: "repriced" | "cancelled" | "replaced";
  cancelled?: boolean;
  replacement?: providers.TransactionResponse;
  receipt?: providers.TransactionReceipt;
};
//@internal
export async function handleTransaction(transaction: any) {
  let tx;

  const awaitTransaction = async (trans: providers.TransactionResponse) => {
    let tx: providers.TransactionReceipt;
    try {
      tx = await trans.wait(1);
    } catch (error: any) {
      const e = error as txError;
      if ((e.reason == "replaced" || e.reason == "repriced") && e.replacement) {
        tx = await awaitTransaction(e.replacement);
      } else if (e.reason == "cancelled") {
        throw new Error("Transaction cancelled");
      } else {
        throw new Error(e.reason || e?.toString());
      }
    }
    return tx;
  };

  tx = await awaitTransaction(transaction);

  return tx;
}

//@internal
export const validateListingParams = (
  listingParams: Partial<ListingParams>
) => {
  if (!utils.isAddress(listingParams.address || "")) {
    throw Error("Address is not valid");
  }
  if (listingParams.address == constants.AddressZero) {
    throw Error("Address cannot be zero address");
  }
  if (!listingParams.price) {
    throw Error("Price is missing");
  }
  if (listingParams.price <= 0) {
    throw Error("Price cannot be zero or lower");
  }
  const quantity = listingParams.quantity ?? 1;
  if (quantity <= 0) {
    throw Error("Quantity cannot be zero or lower");
  }
  if (
    listingParams.acceptedPayment &&
    !utils.isAddress(listingParams.acceptedPayment)
  ) {
    throw Error("AcceptedPayment address is invalid");
  }
  if (!listingParams.token_id) {
    throw Error("Token id is missing");
  }

  return true;
};

export const generateListingId = (
  sellerAddress: address,
  contractAddress: address,
  tokenId: string
) => {
  //using abi encoder as apparently more secure
  //https://github.com/ethers-io/ethers.js/issues/468#issuecomment-475990764
  return ethers.utils.solidityKeccak256(
    ["address", "address", "uint256"],
    [sellerAddress, contractAddress, tokenId]
  );
};

//@internal
export const isProvider = (providerOrSigner: ProviderOrSigner) => {
  if (!!(providerOrSigner as providers.Web3Provider)._isProvider) {
    return true;
  }
  return false;
};

const implementatioNeedsWrapper = async (
  implementationAddress: address,
  providerOrSigner: ProviderOrSigner
) => {
  // Check if implementationAddress supports ERC1155 or ERC721 and if not, check if it has a wrapper
  const supportInterfaceContract: SupportsInterface = new ethers.Contract(
    implementationAddress,
    supportsInterfaceABI,
    providerOrSigner
  ) as SupportsInterface;

  let needsWrapper = false;
  try {
    const isERC721 = await supportInterfaceContract.supportsInterface(
      ERC721_INTERFACE_ID
    );
    if (!isERC721) {
      const isERC1155 = await supportInterfaceContract.supportsInterface(
        ERC1155_INTERFACE_ID
      );
      if (!isERC1155) {
        needsWrapper = true;
      }
    }
  } catch (e: any) {
    const err = e.toString ? e.toString() : e;
    console.error(err);
    return false;
  }

  return !!needsWrapper;
};

//@internal
export const getContractsByNetwork = (network: Network): ContractsByNetwork => {
  return CONTRACTS[network];
};
//@internal
export const getIsApproved = async (
  contract: Marketplacev1,
  implementationAddress: string,
  userWallet: string,
  network: Network
) => {
  if (!contract) {
    throw Error("SDK not initialized");
  }
  if (!ethers.utils.isAddress(implementationAddress)) {
    throw Error("implementationAddress is invalid");
  }
  if (!ethers.utils.isAddress(userWallet)) {
    throw Error("userWallet is invalid");
  }
  const providerOrSigner = contract.signer || contract.provider;
  // Check if implementationAddress supports ERC1155 or ERC721 and if not, check if it has a wrapper
  const needsWrapper = await implementatioNeedsWrapper(
    implementationAddress,
    providerOrSigner
  );

  let wrapper: string | undefined;
  if (needsWrapper) {
    const wrapperRegistryContract: WrapperRegistry = new ethers.Contract(
      getContractsByNetwork(network).wrapperRegistry,
      wrapperRegistryABI,
      providerOrSigner
    ) as WrapperRegistry;

    try {
      let [, , wrapper_] =
        await wrapperRegistryContract.fromImplementationAddress(
          implementationAddress
        );
      if (wrapper_ && ethers.constants.AddressZero !== wrapper_) {
        wrapper = wrapper_;
      }
    } catch (e: any) {
      const err = e.toString ? e.toString() : e;
      console.error(err);
      return false;
    }
  }

  const operatorToSet = wrapper || getContractsByNetwork(network).marketplace;
  const contractToCallInstance: Approval = new ethers.Contract(
    implementationAddress,
    approvalContractABI,
    providerOrSigner
  ) as Approval;
  try {
    // If we have a wrapper, this essentially becomes "wrapper.isApprovedForAll(from,wrapper)"
    const isApproved = await contractToCallInstance.isApprovedForAll(
      userWallet,
      operatorToSet
    );

    return isApproved;
  } catch (e: any) {
    const err = e.toString ? e.toString() : e;
    console.error(err);
    return false;
  }
};

//@internal
export const askApproval = async (
  contract: Marketplacev1,
  implementationAddress: string,
  userWallet: string,
  network: Network,
  emit?: (event: string, ...args: any[]) => void
) => {
  if (!contract) {
    throw Error("SDK not initialized");
  }
  if (!ethers.utils.isAddress(implementationAddress)) {
    throw Error("implementationAddress is invalid");
  }
  if (!ethers.utils.isAddress(userWallet)) {
    throw Error("userWallet is invalid");
  }
  const providerOrSigner = contract.signer || contract.provider;
  const wrapperRegistryContract: WrapperRegistry = new ethers.Contract(
    getContractsByNetwork(network).wrapperRegistry,
    wrapperRegistryABI,
    providerOrSigner
  ) as WrapperRegistry;
  let wrapper: address | undefined;

  try {
    let [, , wrapper_] =
      await wrapperRegistryContract.fromImplementationAddress(
        implementationAddress
      );
    if (wrapper_ && ethers.constants.AddressZero !== wrapper_) {
      wrapper = wrapper_;
    }
  } catch (e: any) {
    const err = e.toString ? e.toString() : e;
    console.warn(err);
  }

  const operatorToSet = wrapper || getContractsByNetwork(network).marketplace;
  const contractToCallInstance: ethers.Contract = new ethers.Contract(
    implementationAddress,
    approvalContractABI,
    providerOrSigner
  );
  !!emit && emit("approval:tx-start");

  let tx;
  try {
    tx = await contractToCallInstance.setApprovalForAll(operatorToSet, true);
  } catch (e: any) {
    const err = e.toString ? e.toString() : e;
    console.error(err);
    return false;
  }

  emit && emit("approval:tx-hash", { hash: tx.hash });

  try {
    const receipt = await handleTransaction(tx);
    emit && emit("approval:tx-mined", { hash: receipt.transactionHash });
    return receipt.status == 1;
  } catch (e: any) {
    const err = e.toString ? e.toString() : e;
    console.error(err);
    emit && emit("error", { error: err });
    return false;
  }
};

export const getAddressFromSigner = async (signer: ethers.Signer) => {
  return await signer.getAddress();
};
