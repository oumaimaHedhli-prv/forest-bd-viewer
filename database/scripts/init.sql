-- Initialize PostGIS and create schema + sample data for forest and cadastral parcels.

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create forest_data table with a PostGIS geometry column (MULTIPOLYGON)
CREATE TABLE IF NOT EXISTS forest_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region TEXT,
  department TEXT,
  commune TEXT,
  lieuxdit TEXT,
  tree_species TEXT,
  surface_area NUMERIC,
  geometry geometry(MULTIPOLYGON, 4326),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cadastral_parcels table
CREATE TABLE IF NOT EXISTS cadastral_parcels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commune_code VARCHAR(10),
  commune_name VARCHAR(100),
  section VARCHAR(10),
  parcel_number VARCHAR(50),
  geometry geometry(MULTIPOLYGON, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table to store user map state (last view)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_map_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  map_position JSONB,
  map_zoom NUMERIC,
  map_filters JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sample data for forest_data (replace with real BD Forêt import)
INSERT INTO forest_data (region, department, commune, lieuxdit, tree_species, surface_area, geometry, description)
VALUES
  ('Nouvelle-Aquitaine', 'Gironde', 'Bordeaux', 'Forêt des Landes', 'Pin maritime', 45000.8,
   ST_Multi(ST_GeomFromText('POLYGON((-1.2 44.8, -1.0 44.8, -1.0 45.0, -1.2 45.0, -1.2 44.8))', 4326)),
   'Grande forêt de pins maritimes'),
  ('Grand Est', 'Vosges', 'Épinal', 'Forêt vosgienne', 'Sapin', 18500.3,
   ST_Multi(ST_GeomFromText('POLYGON((6.4 48.1, 6.6 48.1, 6.6 48.3, 6.4 48.3, 6.4 48.1))', 4326)),
   'Forêt de montagne des Vosges'),
  ('Île-de-France', 'Seine-et-Marne', 'Fontainebleau', 'Forêt de Fontainebleau', 'Chêne', 25000.5,
   ST_Multi(ST_GeomFromText('POLYGON((2.6 48.4, 2.8 48.4, 2.8 48.5, 2.6 48.5, 2.6 48.4))', 4326)),
   'Célèbre forêt de Fontainebleau');

-- Example cadastral parcel (sample polygon)
INSERT INTO cadastral_parcels (commune_code, commune_name, section, parcel_number, geometry)
VALUES
  ('33063','Bordeaux','A','123', ST_Multi(ST_GeomFromText('POLYGON((-0.58 44.82, -0.57 44.82, -0.57 44.83, -0.58 44.83, -0.58 44.82))', 4326)));

-- Create spatial indexes for performance
CREATE INDEX IF NOT EXISTS idx_forest_data_geom ON forest_data USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_cadastral_parcels_geom ON cadastral_parcels USING GIST (geometry);

-- BBOX indexes (optional) for faster envelope queries
CREATE INDEX IF NOT EXISTS idx_forest_data_bbox ON forest_data USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_cadastral_parcels_bbox ON cadastral_parcels USING GIST (geometry);

-- Text search / trigram indexes to speed up region/commune/species search
CREATE INDEX IF NOT EXISTS idx_forest_data_region_trgm ON forest_data USING GIN (region gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_forest_data_commune_trgm ON forest_data USING GIN (commune gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_forest_data_tree_species_trgm ON forest_data USING GIN (tree_species gin_trgm_ops);

-- Materialized view joining forest and parcels for quick spatial intersection queries
DROP MATERIALIZED VIEW IF EXISTS forest_cadastral_view;
CREATE MATERIALIZED VIEW forest_cadastral_view AS
SELECT 
  f.id AS forest_id,
  f.region,
  f.department,
  f.commune,
  f.tree_species,
  f.surface_area,
  c.id AS parcel_id,
  c.commune_name,
  c.section,
  c.parcel_number,
  ST_Intersection(f.geometry, c.geometry) AS intersection_geom
FROM forest_data f
JOIN cadastral_parcels c
  ON ST_Intersects(f.geometry, c.geometry);

CREATE INDEX IF NOT EXISTS idx_forest_cadastral_view_forest_id ON forest_cadastral_view(forest_id);
CREATE INDEX IF NOT EXISTS idx_forest_cadastral_view_parcel_id ON forest_cadastral_view(parcel_id);

-- Analyze tables for planner statistics
ANALYZE forest_data;
ANALYZE cadastral_parcels;
ANALYZE forest_cadastral_view;