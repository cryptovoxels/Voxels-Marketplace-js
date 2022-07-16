import { ethers } from 'ethers';
import test from 'tape'
import {generateListingId, Marketplace} from '../src/index'
import { askApproval, getIsApproved } from '../src/lib/helpers';
import { ListingInfo, ListingParams } from '../src/lib/types';
import { marketplaceHandlersOptions } from '../src/marketplace';
const MockERC721JSON = require('./abis/MockERC721.json')

// Once a Ganache node is running, it behaves very similar to a
// JSON-RPC API node.
const url = "http://localhost:8545";
// Or if you are running the UI version, use this instead:
// const url = "http://localhost:7545"

const provider = new ethers.providers.JsonRpcProvider(url);
const signer = provider.getSigner()
const signer2 = provider.getSigner(1)

let mockERC721:ethers.Contract;

const marketplaceHandlers:marketplaceHandlersOptions = {
    onTxStart:()=>console.log('tx started'),
    onApprovalTxStart:()=>console.log('approval tx started'),
    onTxMined:undefined,
}

//Custom function to create heeaps of orders
test('markeplace.test.ts: Setup()', async (t) => {
    const mockErc721Factory = new ethers.ContractFactory(MockERC721JSON.abi,MockERC721JSON.bytecode,signer)
    mockERC721 = await mockErc721Factory.deploy()
    await mockERC721.mint(1)
    await mockERC721.mint(2)
    t.end()
})

test('markeplace.test.ts:  Make sure env vars are set', (t) => {
    t.ok(process.env.TOKEN_REGISTRY_CONTRACT)
    t.ok(process.env.MARKETPLACE_CONTRACT)
    t.end()
})

test('markeplace.test.ts: Create marketplace object', async (assert) => {
    const market = new Marketplace(signer,marketplaceHandlers,'local')
    assert.ok(market)
    assert.ok(market.onTxStart)
    assert.notOk(market.onTxMined)
    market.dispose()
    assert.end()
})

test('markeplace.test.ts: market list item', async (assert) => {
    assert.plan(5);

    const onTxHash=(hash:string)=>{
        // Make sure event was fired
        assert.ok(hash)
    }
    const onTxStart=()=>{
        // Make sure event was fired
        assert.ok(true)
    }
    const onTxMined=(hash:string)=>{
        // Make sure event was fired
        assert.ok(hash)
    }

    const handlers = Object.assign({},{onTxStart,onTxHash,onTxMined})
    const market = new Marketplace(signer,handlers,'local')
    assert.equal(market.listeners('@:tx-hash').length,1)
    const params:ListingParams = {
        token_id:'1',
        address:mockERC721.address,
        price:0.1,
        quantity:1,
        acceptedPayment:ethers.constants.AddressZero
    }

    let listing = await market.createListing(params)
    assert.ok(listing)

})


test('markeplace.test.ts: Stop listeners', async (assert) => {
    const market = new Marketplace(signer,marketplaceHandlers,'local')
    assert.ok(market)
    assert.equal(market.listeners('@:tx-hash').length,1)
    market.dispose()
    assert.equal(market.listeners('@:tx-hash').length,0)
    assert.end()
})