import { ethers } from 'ethers';
import test from 'tape'
import {generateListingId, VoxelsMarketplace} from '../src/index'
import { askApproval, getIsApproved } from '../src/lib/helpers';
import { ListingParams } from '../src/lib/types';
const MockERC721JSON = require('./abis/MockERC721.json')

// Once a Ganache node is running, it behaves very similar to a
// JSON-RPC API node.
const url = "http://localhost:8545";
// Or if you are running the UI version, use this instead:
// const url = "http://localhost:7545"

const provider = new ethers.providers.JsonRpcProvider(url);
const signer = provider.getSigner()

const mockErc721Factory = new ethers.ContractFactory(MockERC721JSON.abi,MockERC721JSON.bytecode,signer)
const mockERC721 = await mockErc721Factory.deploy()
mockERC721.mint(1)

const sdk:VoxelsMarketplace = new VoxelsMarketplace(signer,'local')
//Custom function to create heeaps of orders

test('Make sure env vars are set', (t) => {
    t.ok(process.env.TOKEN_REGISTRY_CONTRACT)
    t.ok(process.env.MARKETPLACE_CONTRACT)
    t.end()
})

test('Helpers: Approval mockERC721 is false', async (assert) => {
    const wallet = await signer.getAddress()

    let isApproved = await getIsApproved(sdk.contract,mockERC721.address,wallet,'local')
    assert.false(isApproved,"Contract should not be approved")
    assert.end()
})

test('Helpers: ask Approval mockERC721', async (assert) => {
    const wallet = await signer.getAddress()

    let isApproved = await askApproval(sdk.contract,mockERC721.address,wallet,'local',sdk.emit)
    assert.true(isApproved,"Contract should now be approved")
    assert.end()
})

test('SDK list item', async (assert) => {

    const params:ListingParams = {
        token_id:'1',
        address:mockERC721.address,
        price:0.1,
        quantity:1,
        acceptedPayment:ethers.constants.AddressZero
    }
    
    let p = await sdk.listItem(params)
    assert.ok(p)
    assert.end()
})


test('SDK Get listing', async (assert) => {
    const params:ListingParams = {
        token_id:'1',
        address:mockERC721.address,
        price:0.1,
        quantity:1,
        acceptedPayment:ethers.constants.AddressZero
    }
    
    const wallet = await signer.getAddress()
    const id = generateListingId(wallet,params.address,params.token_id)

    let listing = await sdk.getListing(id)
    if(!listing){
        assert.fail('Unexpected: No listing found')
        assert.end()
        return
    }
    console.log(listing)
    assert.equal(listing.acceptedPayment,ethers.constants.AddressZero,'acceptedPayment should be address Zero')
    assert.equal(listing.contractAddress,params.address,'contractAddress should be '+params.address)
    assert.equal(listing.seller,wallet,'Seller should be '+wallet)
    assert.equal(listing.quantity,params.quantity,'Quantity should be '+params.quantity)
    assert.end()

})