import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ForestData } from '../entities/forest-data.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'datafabric-local',
  database: process.env.DB_NAME || 'forest_db',
  entities: [User, ForestData],
  synchronize: true, // Réactiver temporairement pour créer les tables
  logging: process.env.NODE_ENV === 'development',
};
