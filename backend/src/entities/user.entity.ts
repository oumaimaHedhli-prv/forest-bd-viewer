import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Column()
  password: string;

  @Field({ nullable: true })
  @Column({ type: 'float', nullable: true })
  lastMapLat: number;

  @Field({ nullable: true })
  @Column({ type: 'float', nullable: true })
  lastMapLng: number;

  @Field({ nullable: true })
  @Column({ type: 'int', nullable: true })
  lastMapZoom: number;

  @Field(() => GraphQLJSON as unknown as object, { nullable: true })
  @Column({ type: 'json', nullable: true })
  lastMapFilters: Record<string, any> | null;

  @Column({ type: 'json', nullable: true })
  mapPosition: { lat: number; lng: number } | null;

  @Column({ type: 'float', nullable: true })
  mapZoom: number | null;

  @Column({ type: 'json', nullable: true })
  mapFilters: Record<string, any> | null;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
