import { ethers } from "ethers";
import { providers } from "ethers/lib/ethers";

export type Network = "mainnet" | "rinkeby" | "polygon" | "mumbai" | "local";
export type address = string;
export type ListingId = string;

export type ProviderOrSigner =
  | providers.BaseProvider
  | providers.Web3Provider
  | providers.JsonRpcProvider
  | ethers.Signer;

export interface ListingParams {
  token_id: string;
  address: string;
  price: number;
  quantity: number;
  acceptedPayment: string;
}

export type ListingInfo = ListingParams & { seller: string };

export interface ListingIndexes {
  hash: ListingId;
  index: number;
}

export interface ErrorEvent {
  error: string;
}
export interface EventStarted {
  hash: string;
}
export interface EventSuccess {
  hash: string;
}

export interface ContractsByNetwork {
  wrapperRegistry: string;
  marketplace: string;
  tokenRegistry: string;
}

type IndexingParameters = {
  id: ListingId;
  index?: number;
};
export type IndexingObject = Required<IndexingParameters>;
