/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ForestData } from '../entities/forest-data.entity';
import { ForestFilterInput } from '../common/dto/forest.dto';
import { PolygonStats } from '../common/dto/forest.dto';
import { BdForet } from '../entities/forest-data.entity';
import { Cadastre } from '../entities/cadastre.entity';

@Injectable()
export class ForestService {
  constructor(
    @InjectRepository(ForestData)
    private forestRepository: Repository<ForestData>,
    private dataSource: DataSource,
  ) {}

  async findAll(filters?: ForestFilterInput): Promise<ForestData[]> {
    const queryBuilder = this.forestRepository.createQueryBuilder('forest');

    if (filters) {
      if (filters.region) {
        queryBuilder.andWhere('forest.region ILIKE :region', {
          region: `%${filters.region}%`,
        });
      }

      if (filters.department) {
        queryBuilder.andWhere('forest.department ILIKE :department', {
          department: `%${filters.department}%`,
        });
      }

      if (filters.commune) {
        queryBuilder.andWhere('forest.commune ILIKE :commune', {
          commune: `%${filters.commune}%`,
        });
      }

      if (filters.treeSpecies) {
        queryBuilder.andWhere('forest.treeSpecies ILIKE :treeSpecies', {
          treeSpecies: `%${filters.treeSpecies}%`,
        });
      }

      if (filters.minSurfaceArea) {
        queryBuilder.andWhere('forest.surfaceArea >= :minSurfaceArea', {
          minSurfaceArea: filters.minSurfaceArea,
        });
      }

      if (filters.maxSurfaceArea) {
        queryBuilder.andWhere('forest.surfaceArea <= :maxSurfaceArea', {
          maxSurfaceArea: filters.maxSurfaceArea,
        });
      }

      // Bounding box filtering for map viewport
      if (filters.north && filters.south && filters.east && filters.west) {
        queryBuilder.andWhere(
          'ST_Intersects(forest.geometry, ST_MakeEnvelope(:west, :south, :east, :north, 4326))',
          {
            west: filters.west,
            south: filters.south,
            east: filters.east,
            north: filters.north,
          },
        );
      }
    }

    return queryBuilder.limit(1000).getMany(); // Limit for performance
  }

  async getUniqueRegions(): Promise<string[]> {
    const result = await this.forestRepository
      .createQueryBuilder('forest')
      .select('DISTINCT forest.region', 'region')
      .getRawMany();
    return result.map((r: { region: string }) => r.region);
  }

  async getUniqueDepartments(region?: string): Promise<string[]> {
    const queryBuilder = this.forestRepository
      .createQueryBuilder('forest')
      .select('DISTINCT forest.department', 'department');

    if (region) {
      queryBuilder.where('forest.region = :region', { region });
    }

    const result: { department: string }[] = await queryBuilder.getRawMany();
    return result.map((d: { department: string }) => d.department);
  }

  async getUniqueCommunes(department?: string): Promise<string[]> {
    const queryBuilder = this.forestRepository
      .createQueryBuilder('forest')
      .select('DISTINCT forest.commune', 'commune');

    if (department) {
      queryBuilder.where('forest.department = :department', { department });
    }

    const result: { commune: string }[] = await queryBuilder.getRawMany();
    return result.map((c: { commune: string }) => c.commune);
  }

  async getUniqueTreeSpecies(): Promise<string[]> {
    const result: { treeSpecies: string }[] = await this.forestRepository
      .createQueryBuilder('forest')
      .select('DISTINCT forest.treeSpecies', 'treeSpecies')
      .getRawMany();
    return result.map((t: { treeSpecies: string }) => t.treeSpecies);
  }

  async getStatistics(filters?: ForestFilterInput): Promise<{
    totalArea: number;
    averageArea: number;
    count: number;
  }> {
    const queryBuilder = this.forestRepository.createQueryBuilder('forest');

    // Apply same filters as findAll
    if (filters) {
      if (filters.region) {
        queryBuilder.andWhere('forest.region ILIKE :region', {
          region: `%${filters.region}%`,
        });
      }
      // ... apply other filters similarly
    }

    const result = await queryBuilder
      .select('SUM(forest.surfaceArea)', 'totalArea')
      .addSelect('AVG(forest.surfaceArea)', 'averageArea')
      .addSelect('COUNT(*)', 'count')
      .getRawOne();

    return {
      totalArea: Number(result?.totalArea) || 0,
      averageArea: Number(result?.averageArea) || 0,
      count: Number(result?.count) || 0,
    };
  }

  async getRegions(): Promise<string[]> {
    const regions = await this.forestRepository
      .createQueryBuilder('forest')
      .select('DISTINCT forest.region', 'region')
      .getRawMany();
    return regions.map((r) => r.region);
  }

  async getDepartments(region: string): Promise<string[]> {
    const departments = await this.forestRepository
      .createQueryBuilder('forest')
      .select('DISTINCT forest.department', 'department')
      .where('forest.region = :region', { region })
      .getRawMany();
    return departments.map((d) => d.department);
  }

  async getCommunes(department: string): Promise<string[]> {
    const communes = await this.forestRepository
      .createQueryBuilder('forest')
      .select('DISTINCT forest.commune', 'commune')
      .where('forest.department = :department', { department })
      .getRawMany();
    return communes.map((c) => c.commune);
  }

  async getLieuxDits(commune: string): Promise<string[]> {
    const lieuxDits = await this.forestRepository
      .createQueryBuilder('forest')
      .select('DISTINCT forest.lieuxdit', 'lieuxdit')
      .where('forest.commune = :commune', { commune })
      .getRawMany();
    return lieuxDits?.map((l) => l.lieuxdit);
  }

  async analyzePolygon(coordinatesOrGeojson: any): Promise<PolygonStats> {
    // Accept either a GeoJSON geometry/feature or an array of coordinates (legacy)
    let geomObj: any = null;
    if (!coordinatesOrGeojson) throw new Error('Invalid coordinates');

    // If passed an array of coordinates (draw returned coordinates), handle legacy shape
    if (
      Array.isArray(coordinatesOrGeojson) &&
      coordinatesOrGeojson.length &&
      Array.isArray(coordinatesOrGeojson[0])
    ) {
      // assume coordinatesOrGeojson is a Polygon coordinates array: [ [ [lng, lat], ... ] ] or single ring
      const ring = Array.isArray(coordinatesOrGeojson[0][0])
        ? coordinatesOrGeojson[0]
        : coordinatesOrGeojson;
      geomObj = {
        type: 'Polygon',
        coordinates: ring,
      };
    } else if (
      coordinatesOrGeojson.type &&
      (coordinatesOrGeojson.type === 'Feature' ||
        coordinatesOrGeojson.type === 'FeatureCollection')
    ) {
      // If a Feature was passed, extract geometry
      geomObj =
        coordinatesOrGeojson.type === 'Feature'
          ? coordinatesOrGeojson.geometry
          : (coordinatesOrGeojson.features?.[0]?.geometry ?? null);
    } else if (
      coordinatesOrGeojson.type &&
      (coordinatesOrGeojson.type === 'Polygon' ||
        coordinatesOrGeojson.type === 'MultiPolygon' ||
        coordinatesOrGeojson.type === 'GeometryCollection')
    ) {
      geomObj = coordinatesOrGeojson;
    } else {
      // try to parse if it's a string
      try {
        const parsed =
          typeof coordinatesOrGeojson === 'string'
            ? JSON.parse(coordinatesOrGeojson)
            : coordinatesOrGeojson;
        if (parsed?.type)
          geomObj = parsed.type === 'Feature' ? parsed.geometry : parsed;
      } catch (e) {
        geomObj = null;
      }
    }

    if (!geomObj) throw new Error('Unable to interpret provided geometry');

    const geomText = JSON.stringify(geomObj);

    try {
      // Compute polygon area (in hectares) using projection to metric (3857)
      const polygonAreaResult = await this.dataSource.query(
        `WITH poly AS (SELECT ST_SetSRID(ST_GeomFromGeoJSON($1)::geometry, 4326) AS geom)
         SELECT COALESCE(ST_Area(ST_Transform(geom, 3857)) / 10000, 0) AS area_ha FROM poly;`,
        [geomText],
      );

      const polygonAreaHa = Number(polygonAreaResult?.[0]?.area_ha) || 0;

      // Parcels intersecting polygon and their intersection area (ha)
      const parcels: {
        id: string;
        lieuxdit?: string;
        intersection_ha?: string;
      }[] = await this.dataSource.query(
        `WITH poly AS (SELECT ST_SetSRID(ST_GeomFromGeoJSON($1)::geometry, 4326) AS geom)
         SELECT id, lieuxdit, COALESCE(ST_Area(ST_Transform(ST_Intersection(geometry, poly.geom), 3857)) / 10000, 0) AS intersection_ha
         FROM forest_data, poly
         WHERE ST_Intersects(geometry, poly.geom);`,
        [geomText],
      );

      // Species breakdown: sum of intersection areas per species (ha)
      const speciesRows: { species: string; area_ha: string }[] =
        await this.dataSource.query(
          `WITH poly AS (SELECT ST_SetSRID(ST_GeomFromGeoJSON($1)::geometry, 4326) AS geom)
         SELECT COALESCE(tree_species, '') AS species, COALESCE(SUM(ST_Area(ST_Transform(ST_Intersection(geometry, poly.geom), 3857)) / 10000), 0) AS area_ha
         FROM forest_data, poly
         WHERE ST_Intersects(geometry, poly.geom)
         GROUP BY COALESCE(tree_species, '');`,
          [geomText],
        );

      const speciesBreakdown = (speciesRows || []).map((r) => ({
        species: r.species,
        areaHa: Number(r.area_ha) || 0,
      }));

      const treeSpecies = speciesBreakdown
        .map((s) => s.species)
        .filter((s) => s);

      return {
        totalArea: polygonAreaHa,
        parcelCount: parcels?.length || 0,
        treeSpecies,
        speciesBreakdown,
        parcels: (parcels || []).map((p) => ({
          id: p.id,
          lieuxdit: p.lieuxdit ?? null,
        })),
      } as PolygonStats;
    } catch (err) {
      // Log error and return empty/default stats rather than throwing

      console.error('Error analyzing polygon:', err);
      return {
        totalArea: 0,
        parcelCount: 0,
        treeSpecies: [],
        speciesBreakdown: [],
        parcels: [],
      } as PolygonStats;
    }
  }

  // Rechercher les forêts intersectant une bbox [west, south, east, north]
  async findByBBox(
    bbox: [number, number, number, number],
  ): Promise<ForestData[]> {
    const [west, south, east, north] = bbox;
    const sql = `
      SELECT
        id,
        region,
        department,
        commune,
        lieuxdit,
        tree_species AS "treeSpecies",
        surface_area AS "surfaceArea",
        ST_AsGeoJSON(ST_Centroid(geometry)) AS centroid,
        ST_AsGeoJSON(geometry) AS geometry,
        description
      FROM forest_data
      WHERE geometry && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        AND ST_Intersects(geometry, ST_MakeEnvelope($1, $2, $3, $4, 4326));
    `;
    const rows = await this.dataSource.query(sql, [west, south, east, north]);

    // Map DB rows to ForestData-shaped objects
    return (rows || []).map((r: any) => {
      let geom: any = null;
      try {
        geom = r.geometry
          ? typeof r.geometry === 'string'
            ? JSON.parse(String(r.geometry))
            : r.geometry
          : null;
      } catch (e) {
        geom = null;
      }

      return {
        id: r.id,
        region: r.region,
        department: r.department,
        commune: r.commune,
        lieuxdit: r.lieuxdit ?? r.lieuDit ?? null,
        treeSpecies: r.treeSpecies ?? r.tree_species ?? null,
        surfaceArea: r.surfaceArea ?? r.surface_area ?? 0,
        geometry: geom,
        description: r.description ?? null,
      } as ForestData;
    });
  }

  // Rechercher les forêts intersectant un GeoJSON polygon (stringified)
  async findByPolygon(geojson: any): Promise<ForestData[]> {
    const geomText = JSON.stringify(geojson);
    const sql = `
      SELECT
        id,
        region,
        department,
        commune,
        lieuxdit,
        tree_species AS "treeSpecies",
        surface_area AS "surfaceArea",
        ST_AsGeoJSON(ST_Centroid(geometry)) AS centroid,
        ST_AsGeoJSON(geometry) AS geometry,
        description
      FROM forest_data
      WHERE ST_Intersects(geometry, ST_SetSRID(ST_GeomFromGeoJSON($1), 4326));
    `;
    const rows = await this.dataSource.query(sql, [geomText]);

    return (rows || []).map((r: any) => {
      let geom: any = null;
      try {
        geom = r.geometry
          ? typeof r.geometry === 'string'
            ? JSON.parse(String(r.geometry))
            : r.geometry
          : null;
      } catch (e) {
        geom = null;
      }

      return {
        id: r.id,
        region: r.region,
        department: r.department,
        commune: r.commune,
        lieuxdit: r.lieuxdit ?? r.lieuDit ?? null,
        treeSpecies: r.treeSpecies ?? r.tree_species ?? null,
        surfaceArea: r.surfaceArea ?? r.surface_area ?? 0,
        geometry: geom,
        description: r.description ?? null,
      } as ForestData;
    });
  }

  async findByRegion(region: string): Promise<BdForet[]> {
    // Utilise forestRepository et adapte le champ selon la structure réelle
    const forestData = await this.forestRepository.find({ where: { region } });
    return forestData.map((data) => ({
      ...data,
      id: Number(data.id), // Ensure id is converted to number
      geom: data.geometry, // Map geometry to geom
      essence: data.treeSpecies, // Map treeSpecies to essence
      surface: data.surfaceArea, // Map surfaceArea to surface
    })) as BdForet[];
  }

  async findAllCadastre(): Promise<Cadastre[]> {
    return [];
  }
}
