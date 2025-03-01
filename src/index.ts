require('dotenv').config()
const config = require('config');
import 'reflect-metadata';
import express, {Request, Response} from 'express';
import logger_middleware from './middleware/logger';
import logger from './utils/logger';
import { FeeCollector } from './services/fee-collector';
import { ChainConfig, ParsedFeeCollectedEvents, RawEventLogs } from './types/types';
import { ProcessHistoricalFeeData } from './services/process-historical-fee-data';
import EventEmitter from 'node:events';
import { EtherJSFeesCollectorAdapter } from './services/etherjs-web3-adapter';

import { container } from 'tsyringe';
import { CacheInterface } from './services/interfaces/cahce-inerface';
import { RedisClient } from './services/redis-client';
import { Constants } from './utils/constants';
import { FeeRepositoryInterface } from './services/interfaces/fee-repository-interface';
import { FeeMongoDBRepository } from './services/fee-mongodb-repository';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger_middleware);

app.get('/', (req: Request, res: Response) => {
    res.send("I am working");
});
  
// Health endpoint that returns a simple status message
app.get('/health', (req: Request, res: Response) => {
    //TODO: Add additional health checkes like rpc reachablity, db reachability, etc.
    res.json({ status: 'ok' });
});

// Readiness endpoint that returns a simple status message
app.get('/ready', (req: Request, res: Response) => {
  //TODO: Add additional health checkes like rpc reachablity, db reachability, etc.
  res.json({ status: 'ok' });
});
  
const server = app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});
  

let feeCollector: FeeCollector;
let cache: CacheInterface;
let feeRepository: FeeRepositoryInterface;

async function start() {
    try {
        //Register all dependencies
        registerDependencies()

        // Resolve the cache using the interface token and connect.
        cache = container.resolve<CacheInterface>('CacheInterface');
        await cache.connect(process.env.REDIS_URL!);

        // Resolve the fee repository using the interface token and connect.
        feeRepository = container.resolve<FeeRepositoryInterface>('FeeRepositoryInterface');
        await feeRepository.connect();

        const eventEmitter = new EventEmitter();
        new ProcessHistoricalFeeData(eventEmitter)

        //Initialize all dependencies
        const chainConfig:ChainConfig = config.get(process.env.CHAIN_ID!) as ChainConfig;
        logger.info(`Service started for chain: ${process.env.CHAIN_ID!}`);

        const etherJSFeeCollector = new EtherJSFeesCollectorAdapter<RawEventLogs,ParsedFeeCollectedEvents>(chainConfig);
        feeCollector = new FeeCollector(chainConfig,eventEmitter,etherJSFeeCollector);
        
        await feeCollector.setup();
        await feeCollector.fetchFees();

    } catch (error) {
      logger.error(`Error starting service: ${error}`);
    }
  }

  async function registerDependencies() {
      container.registerSingleton<CacheInterface>('CacheInterface', RedisClient);
      container.registerSingleton<FeeRepositoryInterface>('FeeRepositoryInterface', FeeMongoDBRepository);
  }
  
  async function stop() {
    try {
      //Close all dependencies
      feeCollector.stop();
      feeRepository.disconnect();
      cache.disconnect();

      logger.info('Service stopped');
    } catch (error) {
      logger.error(`Error stopping service: ${error}`);
    }
  }

process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server')
    await stop()
    server.close(() => {
        logger.info('HTTP server closed')
    })
})

start()