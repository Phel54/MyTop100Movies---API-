import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import logger from '../logs/index.log';
dotenv.config();
class Database {
  private static _database: Database;
  private constructor() {
    let dbUrl;
    switch (process.env.NODE_ENV) {
      case 'test':
        dbUrl = process.env.DB_URL_TEST;
        break;
      default:
        dbUrl = process.env.DB_URL_TEST;
        break;
    }
    if (dbUrl) {
      mongoose.connect(dbUrl, {
        maxPoolSize: 5, // Maintain up to 10 socket connections - Default = 5
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      });

      mongoose.connection.on('connected', function () {
        logger.silly('Mongoose default connection is open');
      });

      mongoose.connection.on('error', function (err) {
        console.log('Mongoose default connection has occured ' + err + ' error');
        logger.error('Mongoose default connection has occured ' + err + ' error');
      });

      mongoose.connection.on('disconnected', function () {
        console.log('Mongoose default connection is disconnected');
        logger.warn('Mongoose default connection is disconnected');
        logger.silly('Mongoose default connection is disconnected');
      });

      process.on('SIGINT', function () {
        mongoose.connection.close(function () {
          console.log('Mongoose default connection is disconnected due to application termination');
          logger.error('Mongoose default connection is disconnected due to application termination');
          process.exit(0);
        });
      });
    }
  }
  static getInstance() {
    if (this._database) {
      return this._database;
    }
    return (this._database = new Database());
  }

  static disconnect(){
    return mongoose.connection.close();
  }
}
export default Database;
