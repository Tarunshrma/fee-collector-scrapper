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
            const page_index = req.query.page_index as number | undefined;
            const page_size = req.query.page_size as number | undefined;

            const integrator = req.params.integrator as string | undefined;

            if (integrator === undefined) {
                res.status(400).send('Integrator is required');
                return;
            }

            if (page_index !== undefined && 
                    typeof page_index !== 'number' &&
                page_index < 0) {
                res.status(400).send('page_index must be a positive number');
                return;
            }

            if (page_size !== undefined && 
                    typeof page_size !== 'number' &&
                page_size < 0) {
                res.status(400).send('page_size must be a positive number');
                return;
            }
            const fees = await this.feeRepository.getFee(integrator, page_index!, page_size!);
            res.json({ fees });
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error")
        }
    }
}
