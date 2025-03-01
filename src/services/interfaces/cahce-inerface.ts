export interface CacheInterface{
    /**
     * Connect to cache
     */
    connect(url: string): Promise<void>

    /**
     * Disconnect from cache
     */
    disconnect(): Promise<void>

    /**
     * Set value in cache
     * @param key 
     * @param value 
     */
    setValue(key:string, value:any): Promise<void>

    /**
     * Delete value from cache
     * @param key 
     */
    deleteValue(key:string): Promise<void>
    
    /**
     * Get value from cache
     * @param key 
     */
    getValue(key:string): Promise<void>
}