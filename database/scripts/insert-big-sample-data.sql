-- Script pour injecter 100 000 forêts factices avec des polygones valides
INSERT INTO forest_data (region, department, commune, lieuxdit, tree_species, surface_area, geometry, description)
SELECT
  'Région_' || (trunc(random()*10)+1)::text,
  'D' || lpad((trunc(random()*95)+1)::text, 3, '0'),
  'Commune_' || (trunc(random()*1000)+1)::text,
  'LieuDit_' || (trunc(random()*1000)+1)::text,
  CASE WHEN random() < 0.5 THEN 'Chêne' ELSE 'Pin' END,
  (random()*1000)::numeric(10,2),
  ST_SetSRID(
    ST_Multi(
      ST_MakePolygon(
        ST_GeomFromText(
          'LINESTRING(' ||
          x || ' ' || y || ',' ||
          (x+0.01) || ' ' || y || ',' ||
          (x+0.01) || ' ' || (y+0.01) || ',' ||
          x || ' ' || (y+0.01) || ',' ||
          x || ' ' || y ||
          ')'
        )
      )
    ), 4326
  ),
  'Forêt générée pour test perf'
FROM (
  SELECT
    2 + random()*5 AS x,
    43 + random()*5 AS y
  FROM generate_series(1, 100000)
) AS coords;