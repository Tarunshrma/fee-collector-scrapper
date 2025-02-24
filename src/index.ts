require('dotenv').config()
import express, {Request, Response} from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send("I am working");
});
  
// Health endpoint that returns a simple status message
app.get('/health', (req: Request, res: Response) => {
    //TODO: Add additional health checkes like rpc reachablity, db reachability, etc.
    res.json({ status: 'ok' });
});
  
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
  

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server')
    server.close(() => {
        console.log('HTTP server closed')
    })
})