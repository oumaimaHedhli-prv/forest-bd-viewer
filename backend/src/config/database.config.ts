import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ForestData } from '../entities/forest-data.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,  // Utilise DATABASE_URL si disponible
  entities: [User, ForestData],
  // Disable automatic schema synchronization in containers with existing data
  // to avoid TypeORM trying to alter/drop columns that DB objects (views/indexes)
  // depend on. Use migrations or manual SQL for schema changes.
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};
