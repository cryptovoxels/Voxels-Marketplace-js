import { constants, providers, utils } from "ethers";
import { keccak256 } from "ethers/lib/utils";
import { MARKETPLACE_CONTRACT_RINKEBY } from "./constants";
import { address, ListingParams, Network } from "./types";

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
  if (listingParams.quantity ?? 1 <= 0) {
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
  if (listingParams.seller && !utils.isAddress(listingParams.seller)) {
    throw Error("Seller address is invalid");
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
  return keccak256(
    utils.defaultAbiCoder.encode(
      ["address", "address", "uint256"],
      [
        sellerAddress,
        contractAddress,
        tokenId
      ]
    )
  );
};


export const getContractAddressByNetwork = (network:Network)=>{
  switch (network) {
    case 'rinkeby':
      return MARKETPLACE_CONTRACT_RINKEBY
    case 'mainnet':
      return ''
    case 'polygon':
      return ''
    case 'mumbai':
      return ''
    default:
      return ''
  }
}