/**
 * ChainConfig type
 * @typedef {Object} ChainConfig
 * @property {string} contract_address - Contract address to fetch fees from
 * @property {string} rpc_url - RPC URL to fetch fees from
 * @property {string} secondary_rpc_url - Secondary RPC URL to use in case primary RPC URL fails
 * @property {string} start_block - Block number to start fetching fees from
 * @property {number} block_batch_size - Number of blocks to fetch in a single batch
 */
type ChainConfig = {
    contract_address: string,
    rpc_url: string,
    secondary_rpc_url: string,
    start_block: string,
    block_batch_size: number
}


export default ChainConfig;