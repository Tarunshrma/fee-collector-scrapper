import "reflect-metadata"
import EventEmitter from 'events';
import { ProcessHistoricalFeeData } from './process-historical-fee-data';
import { container } from "tsyringe";
import { FeeRepositoryInterface } from "./interfaces/fee-repository-interface";
import { MockCache, MockFeeRepository } from "../test-helpers/mock-classes";
import { CacheInterface } from "./interfaces/cahce-inerface";


describe('ProcessHistoricalFeeData', () => {
    let processHistoricalFeeCollector: ProcessHistoricalFeeData;

  beforeEach(() => {
    const eventEmitter = new EventEmitter();
    const dummyConfig = {} as any;

    // Clear previous registrations to avoid side effects
    container.clearInstances();
    // Register the mock implementation for FeeRepositoryInterface
    container.registerInstance<FeeRepositoryInterface>('FeeRepositoryInterface', new MockFeeRepository());
    container.registerInstance<CacheInterface>('CacheInterface', new MockCache());
    
    processHistoricalFeeCollector = new ProcessHistoricalFeeData(eventEmitter,dummyConfig);
  });

  afterEach(() => {
    // Stop any asynchronous operations (e.g., interval timers)
    processHistoricalFeeCollector.stop();
  });

  it('should instantiate processHistoricalFeeCollector correctly', () => {
    expect(processHistoricalFeeCollector).toBeInstanceOf(ProcessHistoricalFeeData);
  });
});
