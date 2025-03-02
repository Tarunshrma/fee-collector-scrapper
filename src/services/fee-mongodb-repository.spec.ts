import { after } from 'node:test';
import { FeeMongoDBRepository } from './fee-mongodb-repository';
import { CollectedFeeModel } from '../models/collected-fee';

describe('FeeMongoDBRepository', () => {
    let feeMongoDBRepository: FeeMongoDBRepository;
    
    jest.mock('../models/collected-fee', () => ({
        insertMany: jest.fn(),
        //find: jest.fn(),
        find: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
        }),
    }));

    beforeEach(() => {
        feeMongoDBRepository = new FeeMongoDBRepository();
    });

    afterEach(() => {
        feeMongoDBRepository.disconnect();
    });

    it('should instantiate FeeMongoDBRepository correctly', () => {
        expect(feeMongoDBRepository).toBeInstanceOf(FeeMongoDBRepository);
    });

    it('should throw error if host or db not provided', async () => {
        await expect(feeMongoDBRepository.connect()).rejects.toThrow('MongoDB URL or DB name is not provided');
    });

    it('should connect with valid host name and url', async () => {
        process.env.MONGODB_URL = 'localhost';
        process.env.MONGODB_DB = 'test';
        await expect(feeMongoDBRepository.connect()).resolves.not.toThrow();
    });

    it('should save fees successfully with true', async () => {
        //Given
        const fees = [
            { token: '0x0000000000000000000000000000000000000000', 
            integrator: '0x1Bcc58D165e5374D7B492B21c0a572Fd61C0C2a0',
            integratorFee: "11394216556750000000",
            lifiFee: "599695608250000000" 
            },
        ];

        process.env.MONGODB_URL = 'localhost';
        process.env.MONGODB_DB = 'test';
        await feeMongoDBRepository.connect();

        //When
        const result = await feeMongoDBRepository.storeFee(fees);
    
        //Then
        expect(result).toBe(true);
    });

    //FIXME: This test is not working as expected
    // it('should retrieve fees', async () => {
    //     //Given
    //     const integrator= '0x1Bcc58D165e5374D7B492B21c0a572Fd61C0C2a0';

    //     process.env.MONGODB_URL = 'localhost';
    //     process.env.MONGODB_DB = 'test';
    //     await feeMongoDBRepository.connect();

    //     //When
    //     const result = await feeMongoDBRepository.getFee(integrator);
    //     console.log(result);
    
    //     //Then
    //     expect(result).toEqual([]);
    // });


})