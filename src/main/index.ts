/* eslint-disable */
import 'dotenv';
import { createServer } from 'http';
import app from './server';
import Logger from './logs/index.log';

const httpServer = createServer(app)
const port = process.env.PORT || 3000

try {
    httpServer.listen(port, async () => {
      Logger.silly(`Montech Movie Api Service listening at http://localhost:${port}`);
    });
  } catch (error: any) {
    console.log(error.message);
  }
export default httpServer


