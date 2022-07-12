import { Network, ContractsByNetwork } from "./types";

export const ERC721_INTERFACE_ID = `0x80ac58cd`;
export const ERC1155_INTERFACE_ID = `0xd9b67a26`;
export const WRAPPER_INTERFACE_ID = `0xfe939973`;

export const CONTRACTS: Record<Network, ContractsByNetwork> = {
  mumbai: {
    wrapperRegistry: `0x023D0F59046A9E9b3129cdc7e4555eF82D265cD8`,
    marketplace: `0x4e172BA6A1AF2FD69A60f9B5c9B33723018E51be`,
    tokenRegistry: `0x1830a2bf63d41165cc1f43e4eE4A75528a2F98A4`,
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
