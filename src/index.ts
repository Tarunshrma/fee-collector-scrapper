require('dotenv').config()
const config = require('config');

import express, {Request, Response} from 'express';
import logger_middleware from './middleware/logger';
import logger from './utils/logger';
import { FeeCollector } from './services/fee-collector';
import { ChainConfig } from './types/types';

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
  
const server = app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});
  

async function start() {
    try {
      //Initialize all dependencies
      const chainConfig:ChainConfig = config.get(process.env.CHAIN_ID!) as ChainConfig;
      logger.info(`Service started for chain: ${process.env.CHAIN_ID!}`);

      const feeCollector = new FeeCollector(chainConfig);
      feeCollector.fetchFees();
    } catch (error) {
      logger.error(`Error starting service: ${error}`);
    }
  }
  
  async function stop() {
    try {
      //Close all dependencies
      logger.info('Service stopped');
    } catch (error) {
      logger.error(`Error stopping service: ${error}`);
    }
  }

process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server')
    stop()
    server.close(() => {
        logger.info('HTTP server closed')
    })
})

start()