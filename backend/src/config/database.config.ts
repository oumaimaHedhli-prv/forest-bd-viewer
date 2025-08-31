import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ForestData } from '../entities/forest-data.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,  // Utilise DATABASE_URL si disponible
  entities: [User, ForestData],
  synchronize: true, // Réactiver temporairement pour créer les tables
  logging: process.env.NODE_ENV === 'development',
};
