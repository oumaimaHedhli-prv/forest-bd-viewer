import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
@Entity('cadastre')
export class Cadastre {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  region: string;

  @Field()
  @Column()
  department: string;

  @Field()
  @Column()
  commune: string;

  @Field()
  @Column()
  lieuxdit: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true,
  })
  geometry?: any;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;
}
