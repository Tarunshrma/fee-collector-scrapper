import { mongoose } from "@typegoose/typegoose";
import { ParsedFeeCollectedEvents } from "../types/types";
import { FeeRepositoryInterface } from "./interfaces/fee-repository-interface";
import logger from "../utils/logger";
import { CollectedFeeModel } from "../models/collected-fee";

/**
 * FeeMongoDBRepository class
 * @implements FeeRepositoryInterface
 * This class is concrete implementation of FeeRepositoryInterface for MongoDB
 */
export class FeeMongoDBRepository implements FeeRepositoryInterface {


    /**
     * connect to the database
     */
    public async connect(): Promise<void> {
        try{
            logger.info('Connecting to MongoDB')
            const user_name = process.env.MONGODB_USERNAME;
            const password = process.env.MONGODB_PASSWORD;
            const host = process.env.MONGODB_URL;
            const db = process.env.MONGODB_DB;

            if (!host || !db){
                throw new Error('MongoDB URL or DB name is not provided')
            }

            // if (user_name && password){
            //     await mongoose.connect(`mongodb://${user_name}:${password}@${host}/${db}`);
            // }else{
                await mongoose.connect(`mongodb://${host}/${db}`);
            //}
        }catch(err){
            logger.error(`Error connecting to MongoDB: ${err}`)
            throw err
        }
    }

    /**
     * disconnect from the database
     */
    public async disconnect(): Promise<void> {
        try{
            logger.info('Disconnecting from MongoDB')
            await mongoose.disconnect();
            
        }catch(err){
            logger.error(`Error connecting to MongoDB: ${err}`)
            throw err
        }
    }
    /**
     * store fee into the database
     * @param fee 
     */
    public async storeFee(fees: ParsedFeeCollectedEvents[]): Promise<boolean> {
        try{
            await CollectedFeeModel.insertMany(
                fees.map((fee) => ({
                  token: fee.token,
                  integrator: fee.integrator,
                  integratorFee: fee.integratorFee,
                  lifiFee: fee.lifiFee,
                }))
              );
            return true
        }catch(err){
            throw err
        }
    }

    /**
     * Get fee from the database
     * @param integrator 
     * @param page_index
     * @param page_size
     */
    public async getFee(integrator: string, page_index: number = 0, page_size: number = 10): Promise<ParsedFeeCollectedEvents[]> {
        try {
            const collected_fees = await CollectedFeeModel.find({ integrator })
                .skip(page_index * page_size) 
                .limit(page_size)            
                .exec();
            return collected_fees;  
        } catch(err) {
            throw err;
        }
    }
    
}