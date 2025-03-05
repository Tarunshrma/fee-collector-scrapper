// routes/fee.ts
import { Router, Request, Response } from 'express';
import { FeeRepositoryInterface } from '../../services/interfaces/fee-repository-interface';
import { container } from 'tsyringe';


export class FeeRouter {
    public router: Router;
    private feeRepository: FeeRepositoryInterface;

    constructor() {
        this.router = Router();
        this.init();
        this.feeRepository = container.resolve<FeeRepositoryInterface>('FeeRepositoryInterface');
    }

    private init(): void {
        this.router.get('/v1/fee/:integrator', this.getFees);
    }

    private getFees = async (req: Request, res: Response): Promise<void> => {
        try {
            const pageIndex = req.query.pageIndex as number | undefined;
            const pageSize = req.query.pageSize as number | undefined;

            const integrator = req.params.integrator as string | undefined;

            if (integrator === undefined) {
                res.status(400).send('Integrator is required');
                return;
            }

            if (pageIndex !== undefined && 
                    typeof pageIndex !== 'number' &&
                pageIndex < 0) {
                res.status(400).send('pageIndex must be a positive number');
                return;
            }

            if (pageSize !== undefined && 
                    typeof pageSize !== 'number' &&
                pageSize < 0) {
                res.status(400).send('pageSize must be a positive number');
                return;
            }
            const fees = await this.feeRepository.getFee(integrator, pageIndex!, pageSize!);
            res.json({ fees });
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error")
        }
    }
}
