interface FeeCollectorInterface{
    /**
    * fetch fee from target blockchain
    */
    fetchFees(): Promise<void>;
}

export default FeeCollectorInterface;