**LiFi Event Scrapper**


1. Fetch optimization
  1.1 Configurable to extend to multi-chain (evm)
  1.2 Use dependency injections to inject external dependency e.g. contract factory,
2. Store optimization 
	1.1 Repository Pattern
	1.2 DI for DB library 
	1.3 Efficient storage.. can use batch-store approach to avoid multiple connection. 
	1.4 Redis to keep track of last fetched block
3. Query Optimisation. 
	1.1 Pagination
	1.2 Block Range

Cross boundaries: logging, linting, tracing/open-telemetry, unit testing.

Importnt: Cross-chain support, configurations. 

Doubts: 
1. Do we want the single running instance of application to fetch from multi-chain or we want a single instance per chain, while code is same but configuration paramaters which which instance is launch are different. 
2. I am prpoposing to use both fetchBlock approach to fetch all historical events data and pub-sub approach to listen to any new data. This way we can reduce the letancy of fetching live event data. So it will be like 2 process one which is scrapping all historical data (it will be one time only) and then contiually monitoring live events from events that will only take care of live events. 

**References** 
Scaffold code setup: https://phillcode.hashnode.dev/nodejs-console-app-with-typescript-linting-and-testing