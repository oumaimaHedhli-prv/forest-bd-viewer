import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ForestData } from '../entities/forest-data.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,  
  entities: [User, ForestData],  
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};
