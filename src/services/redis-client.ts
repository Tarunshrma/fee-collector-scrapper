import { createClient } from 'redis';
import logger from '../utils/logger';

export class RedisClient implements CacheInterface{

    private redisClient : any;
    private initialized: boolean = false;
    
    public async connect(url: string){
        try{
            this.redisClient = createClient({ url })
            await this.redisClient.connect();

            this.redisClient.on('error', (err:any) => {
                logger.error(`Redis error: ${err}`)
            });

            this.redisClient.on('connect', () => {
                logger.info('Redis connected successfully');
                this.initialized = true;
            });           
        }catch(error){
            logger.error(`Error connecting to Redis: ${error}`)
        }
    } 

    public async disconnect(){
        await this.redisClient.disconnect();
    } 

    public isConnected(){
        return this.initialized;
    }


    public async setValue(key:string, value:any){
        if (!this.isConnected()){
            throw new Error('Redis client not initialized');
        }
        await this.redisClient.set(key, value);
    }
    
    public async deleteValue(key:string){
        if (!this.isConnected()){
            throw new Error('Redis client not initialized');
        }

        await this.redisClient.del(key);
    }

    public async getValue(key:string){
        if (!this.isConnected()){
            throw new Error('Redis client not initialized');
        }

        const value = await this.redisClient.get(key);
        return value;
    }

}