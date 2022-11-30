/* eslint-disable */
import 'dotenv';
import { createServer } from 'http';
import app from './server';
import { database } from './config/database';
import Logger from './logs/index.log';

const httpServer = createServer(app)
const port = process.env.PORT || 3000
httpServer.listen(port, async () => {
    database()
    Logger.silly( `Movie Api Service listening at http://localhost:${port}`)
})
export default httpServer


