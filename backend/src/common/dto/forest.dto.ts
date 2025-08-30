import { InputType, Field, Float, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber } from 'class-validator';

@InputType()
export class ForestFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  region?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  commune?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  treeSpecies?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  minSurfaceArea?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  maxSurfaceArea?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  north?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  south?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  east?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  west?: number;
}

@ObjectType()
export class SpeciesArea {
  @Field()
  species: string;

  @Field(() => Float)
  areaHa: number;
}

@ObjectType()
export class ParcelInfo {
  @Field()
  id: string;

  @Field({ nullable: true })
  lieuxdit?: string;
}

@ObjectType()
export class PolygonStats {
  @Field(() => Float)
  totalArea: number;

  @Field()
  parcelCount: number;

  @Field(() => [String])
  treeSpecies: string[];

  @Field(() => [SpeciesArea])
  speciesBreakdown: SpeciesArea[];

  @Field(() => [ParcelInfo])
  parcels: ParcelInfo[];
}
