import { Network,ContractsByNetwork } from "./types";

export const ERC721_INTERFACE_ID = `0x80ac58cd`;
export const ERC1155_INTERFACE_ID = `0xd9b67a26`;
export const WRAPPER_INTERFACE_ID = `0xfe939973`;

export const CONTRACTS:Record<Network,ContractsByNetwork>= {
    mumbai:{
        wrapperRegistry:`0x9dbB5FF57435eCb29deA5903143F4C133e79477D`,
        marketplace:`0x5852c5f20BEE68f6dAd36761470528b6Bc2a8b20`,
        tokenRegistry:`0x1830a2bf63d41165cc1f43e4eE4A75528a2F98A4`
    },
    polygon:{
        tokenRegistry:``,
        marketplace:``,
        wrapperRegistry:``,
    },
    rinkeby:{
        tokenRegistry:`0x35bCe40f61004a30527BbABF4b3240042B800A63`,
        marketplace:`0x385f48cB0bc6F1E1E8Afc03B64E047734122Cc6c`,
        wrapperRegistry:``,
    },
    mainnet:{
        tokenRegistry:``,
        marketplace:``,
        wrapperRegistry:``,
    }
}