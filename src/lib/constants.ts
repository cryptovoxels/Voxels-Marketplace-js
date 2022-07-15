import { Network, ContractsByNetwork } from "./types";

export const ERC721_INTERFACE_ID = `0x80ac58cd`;
export const ERC1155_INTERFACE_ID = `0xd9b67a26`;
export const WRAPPER_INTERFACE_ID = `0xfe939973`;

export const CONTRACTS: Record<Network, ContractsByNetwork> = {
  mumbai: {
    wrapperRegistry: `0xABbE873F8f735D8F86A65500635a838268c81180`,
    marketplace: `0xa75BC4AEeB26e7E3ed7Ee54D8B19D23501866132`,
    tokenRegistry: `0xBE06783f7a02cFF726c0d4A6F11e8B3c237030a3`,
  },
  polygon: {
    tokenRegistry: ``,
    marketplace: ``,
    wrapperRegistry: ``,
  },
  rinkeby: {
    tokenRegistry: `0x35bCe40f61004a30527BbABF4b3240042B800A63`,
    marketplace: `0x385f48cB0bc6F1E1E8Afc03B64E047734122Cc6c`,
    wrapperRegistry: ``,
  },
  mainnet: {
    tokenRegistry: ``,
    marketplace: ``,
    wrapperRegistry: ``,
  },
  local: {
    tokenRegistry: process.env.TOKEN_REGISTRY_CONTRACT || "",
    marketplace: process.env.MARKETPLACE_CONTRACT || "",
    wrapperRegistry: process.env.WRAPPER_REGISTRY_CONTRACT || "",
  },
};
