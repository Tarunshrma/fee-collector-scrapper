import { ParsedFeeCollectedEvents } from "../../types/types";

/**
 * FeeRepositoryInterface interface, this will abstract the storage of fee data
 */
export interface FeeRepositoryInterface{

    /**
     * connect to the database
     */
    connect(): Promise<void>;

    /**
     * disconnect from the database
     */
    disconnect(): Promise<void>;
    /**
     * store fee into the database
     * @param fee 
     */
    storeFee(fee:ParsedFeeCollectedEvents[]): Promise<boolean>;

    /**
     * get fee from the database
     * @param integrator
     * @param pageIndex
     * @param pageSize
     */
    getFee(integrator: string,pageIndex: number, pageSize: number): Promise<ParsedFeeCollectedEvents[]>;
}