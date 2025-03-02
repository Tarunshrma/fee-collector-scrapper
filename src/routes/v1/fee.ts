// routes/fee.ts
import { Router, Request, Response } from 'express';
import { FeeRepositoryInterface } from '../../services/interfaces/fee-repository-interface';
import { container } from 'tsyringe';


export class FeeRouter {
    public router: Router;
//    private feeRepository: FeeRepositoryInterface;

    constructor() {
        this.router = Router();
        // this.feeRepository = container.resolve<FeeRepositoryInterface>('FeeRepositoryInterface');
        this.init();
    }

    private init(): void {
        this.router.get('/v1/fee/:integrator', this.getFees);
    }

    private async getFees(req: Request, res: Response) {
        try {
            const page_index = req.query.page_index as number | undefined;
            const page_size = req.query.page_size as number | undefined;

            const integrator = req.params.integrator as string | undefined;

            if (integrator === undefined) {
                res.status(400).send('Integrator is required');
                return;
            }

            // const fees = await this.feeRepository.getFee(integrator);
            res.json({ fees: [] });
        } catch (error) {
            res.status(500).send("Internal Server Error")
        }
    }
}
