import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig = (): TypeOrmModuleOptions => {
  const DB_URL = process.env.DATABASE_URL;
  return {
    type: 'postgres',
    url: DB_URL,
    entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
    synchronize: true,
    ssl: false,
    logging: ['error'],
    retryAttempts: 3,
    retryDelay: 3000,
    connectTimeoutMS: 10000,
  };
};
