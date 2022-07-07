export type Network = "mainnet" | "rinkeby" | "polygon" | "mumbai";
export type address = string;
export type ListingId = string
export interface ListingParams {
  token_id: string;
  address: string;
  price: number;
  quantity: number;
  acceptedPayment: string;
  seller?: string;
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
