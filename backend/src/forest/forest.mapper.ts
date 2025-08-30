/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ForestData } from '../entities/forest-data.entity';

export function mapRowToForestData(r: any): ForestData {
  let geom: any = null;
  try {
    geom = r?.geometry
      ? typeof r?.geometry === 'string'
        ? JSON.parse(r?.geometry)
        : r?.geometry
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
}
