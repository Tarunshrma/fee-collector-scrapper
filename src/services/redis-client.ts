import { createClient } from 'redis';
import logger from '../utils/logger';
import { singleton } from 'tsyringe';
import { CacheInterface } from './interfaces/cahce-inerface';

/**
 * RedisClient class
 * @implements CacheInterface
 * TODO: This is a very basic implementation of a Redis client, can be made more generic
 * currently it is only used for caching string data
 */
@singleton()
export class RedisClient implements CacheInterface{
    
    private redisClient : any;
    
    /**
     * Connect to Redis
     * @param url 
     */
    public async connect(url: string){
        try{
            console.log(`Connecting to Redis: ${url}`)
            this.redisClient = createClient({ url })
            await this.redisClient.connect();

            this.redisClient.on('error', (err:any) => {
                logger.error(`Redis error: ${err}`)
            });

            this.redisClient.on('connect', () => {
                logger.info('Redis connected successfully');
            });           
        }catch(error){
            logger.error(`Error connecting to Redis: ${error}`)
        }
    } 

    /**
     * Disconnect from Redis
     */
    public async disconnect(){
        try{
            await this.redisClient.disconnect();
        }catch(error){
            throw error;
        }
    } 

    /**
     * Store the value in Redis
     * @param key 
     * @param value 
     */
    public async setValue(key:string, value:any){
        try{
            await this.redisClient.set(key, value);
        }catch(error){
            throw error;
        }
    }
    
    /**
     * Delete the value from Redis
     * @param key 
     */
    public async deleteValue(key:string){
        try{
            await this.redisClient.del(key);
        }catch(error){
            throw error;
        }
    }

    /**
     * Get the value from Redis
     * @param key 
     * @returns 
     */
    public async getValue(key:string):Promise<string>{
        try{
            const value = await this.redisClient.get(key);
            return value;
        }catch(error){
            throw error;
        }
    }
}