/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Resolver,
  Query,
  Args,
  ObjectType,
  Field,
  Float,
  Mutation,
} from '@nestjs/graphql';
import { ForestService } from './forest.service';
import { ForestData } from '../entities/forest-data.entity';
import { ForestFilterInput, PolygonStats } from '../common/dto/forest.dto';
import { BdForet } from '../entities/forest-data.entity';
import { Cadastre } from '../entities/cadastre.entity';

@ObjectType()
export class ForestStatistics {
  @Field(() => Float)
  totalArea: number;

  @Field(() => Float)
  averageArea: number;

  @Field()
  count: number;
}

@Resolver(() => ForestData)
export class ForestResolver {
  constructor(private readonly forestService: ForestService) {}

  @Query(() => [ForestData])
  async forests(
    @Args('filters', { nullable: true }) filters?: ForestFilterInput,
  ): Promise<ForestData[]> {
    return this.forestService.findAll(filters);
  }

  @Query(() => [String])
  async regions(): Promise<string[]> {
    return this.forestService.getUniqueRegions();
  }

  @Query(() => [String])
  async departments(
    @Args('region', { nullable: true }) region?: string,
  ): Promise<string[]> {
    return this.forestService.getUniqueDepartments(region);
  }

  @Query(() => [String])
  async communes(
    @Args('department', { nullable: true }) department?: string,
  ): Promise<string[]> {
    return this.forestService.getUniqueCommunes(department);
  }

  @Query(() => [String])
  async treeSpecies(): Promise<string[]> {
    return this.forestService.getUniqueTreeSpecies();
  }

  @Query(() => ForestStatistics)
  async forestStatistics(
    @Args('filters', { nullable: true }) filters?: ForestFilterInput,
  ): Promise<ForestStatistics> {
    return this.forestService.getStatistics(filters);
  }

  @Query(() => [String])
  async getRegions(): Promise<string[]> {
    return this.forestService.getRegions();
  }

  @Query(() => [String])
  async getDepartments(@Args('region') region: string): Promise<string[]> {
    return this.forestService.getDepartments(region);
  }

  @Query(() => [String])
  async getCommunes(@Args('department') department: string): Promise<string[]> {
    return this.forestService.getCommunes(department);
  }

  @Query(() => [String])
  async getLieuxDits(@Args('commune') commune: string): Promise<string[]> {
    return this.forestService.getLieuxDits(commune);
  }

  @Mutation(() => PolygonStats)
  async submitPolygon(
    @Args('geojson', { type: () => String }) geojson: string,
  ): Promise<PolygonStats> {
    let parsed: any;
    try {
      parsed = JSON.parse(geojson);
    } catch (e) {
      // If it's already an object, use it
      parsed = geojson as any;
    }
    return this.forestService.analyzePolygon(parsed);
  }

  @Query(() => [ForestData])
  async forestsByBBox(
    @Args('bbox', { type: () => [Float] }) bbox: number[], // expect [west, south, east, north]
  ): Promise<ForestData[]> {
    const rows = await this.forestService.findByBBox(
      bbox as [number, number, number, number],
    );

    // Service already returns ForestData-shaped objects
    return rows || [];
  }

  @Query(() => [ForestData])
  async forestsByPolygon(
    @Args('geojson', { type: () => String }) geojson: string,
  ): Promise<ForestData[]> {
    let parsed: any;
    try {
      parsed = JSON.parse(geojson);
    } catch (e) {
      parsed = geojson as any;
    }
    const rows: ForestData[] = await this.forestService.findByPolygon(parsed);
    return rows || [];
  }

  @Query(() => [Cadastre])
  async cadastralData(): Promise<Cadastre[]> {
    return this.forestService.findAllCadastre();
  }
}

@Resolver(() => BdForet)
export class BdForetResolver {
  constructor(private readonly forestService: ForestService) {}

  @Query(() => [BdForet])
  async bdforetByRegion(@Args('region') region: string): Promise<BdForet[]> {
    return this.forestService.findByRegion(region);
  }
}
