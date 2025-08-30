-- Rebuild indexes and collect statistics after imports

CREATE INDEX IF NOT EXISTS idx_forest_data_geom ON forest_data USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_cadastral_parcels_geom ON cadastral_parcels USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_forest_data_region_trgm ON forest_data USING GIN (region gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_forest_data_commune_trgm ON forest_data USING GIN (commune gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_forest_data_tree_species_trgm ON forest_data USING GIN (tree_species gin_trgm_ops);

ANALYZE forest_data;
ANALYZE cadastral_parcels;
ANALYZE forest_cadastral_view;

-- Créer des index pour les requêtes spatiales fréquentes
CREATE INDEX IF NOT EXISTS idx_forest_data_bbox 
ON forest_data USING GIST (ST_Envelope(geometry));

CREATE INDEX IF NOT EXISTS idx_cadastral_parcels_bbox 
ON cadastral_parcels USING GIST (ST_Envelope(geometry));

-- Index pour les recherches textuelles
CREATE INDEX IF NOT EXISTS idx_forest_data_tree_species_gin 
ON forest_data USING GIN (tree_species gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_forest_data_commune_gin 
ON forest_data USING GIN (commune gin_trgm_ops);
