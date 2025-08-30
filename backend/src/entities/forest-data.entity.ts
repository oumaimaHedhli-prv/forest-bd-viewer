/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
@Entity('forest_data')
export class ForestData {
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

  // Make treeSpecies nullable to avoid schema sync errors when existing rows have null values
  @Field({ nullable: true })
  @Column({ name: 'tree_species', nullable: true })
  treeSpecies?: string;

  // Make surfaceArea nullable to avoid schema sync errors when existing rows have null values
  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', name: 'surface_area', nullable: true })
  surfaceArea?: number;

  // Geometry column is stored in the DB; map to the existing column name 'geometry' and allow nullable
  @Column({
    name: 'geometry',
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true,
  })
  privateGeometry?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  get geometry(): any {
    return this.privateGeometry;
  }

  set geometry(val: any) {
    this.privateGeometry = val;
  }

  @Field(() => GraphQLJSON, { nullable: true })
  centroid?: any;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;
}

@Entity('bdforet')
export class BdForet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326 })
  geom: string;

  @Column()
  essence: string;

  @Column()
  surface: number;
}
