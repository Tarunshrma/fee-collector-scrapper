**Thought Process**
- Fetch
    - Historical blocks: Need to download all historical data upto given block number
        * Challange:
            - RPC rate limiting.
            - Memory overflow
        * Potential Solutions:
            - Fetch with a default buffer size
            - Flush the buffer in plain file 
    - Live blocks : Fetching the live blocks
        * Parallel process with historical block fecthing  
- Store
- Retrieve