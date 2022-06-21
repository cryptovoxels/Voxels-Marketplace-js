export type Network = "mainnet" | "rinkeby" | "polygon";
export type address = string;
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
