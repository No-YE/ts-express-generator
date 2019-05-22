import express from 'express';
import router from './routes/index';

const app: express.Application = express();

app.use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(router)
  .use((req: express.Request, res: express.Response) => res.status(404).end())
  .use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).end();
  });

export default app;
