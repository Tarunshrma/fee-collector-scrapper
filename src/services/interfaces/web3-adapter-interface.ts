interface Web3AdapterInterface<E,T> {
    /**
     * Fetch raw blocks from target blockchain and return them as an array of E
     * @param from from block number
     * @param to to block number
     * @returns E[] returns an array of raw blocks
     */
    fetchRawFeesCollectedEvents(from:string , to :string): Promise<E[]>

    /**
     * Parse raw blocks into target type T
     * @param rawBlocks  raw blocks to parse
     * @param targetType target type to parse raw blocks into
     * @returns T[]
     */
    parseRawBlocks(rawBlocksEvent:E[]): Promise<T[]>;

    /**
     * Get the latest block number
     * @returns number
     */
    getLatestBlockNumber(): Promise<number>;
}

export default Web3AdapterInterface;