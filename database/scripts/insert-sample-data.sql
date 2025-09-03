-- Insertion de données d'exemple BD Forêt® V2 pour tester le système
-- Suivant la hiérarchie administrative française : région → département → commune → lieu-dit

-- Données pour la région Île-de-France
INSERT INTO forest_data (region, department, commune, lieuxdit, tree_species, surface_area, geometry, description)
VALUES 
  -- Seine-et-Marne (77)
  ('Île-de-France', 'Seine-et-Marne', 'Fontainebleau', 'Forêt Domaniale de Fontainebleau', 'Chêne sessile', 1250.5, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((2.6800 48.4100, 2.7200 48.4100, 2.7200 48.3800, 2.6800 48.3800, 2.6800 48.4100))')), 4326),
   'Forêt domaniale historique, peuplements de chênes centenaires'),
  
  ('Île-de-France', 'Seine-et-Marne', 'Fontainebleau', 'Les Gorges de Franchard', 'Hêtre commun', 350.2, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((2.6500 48.4050, 2.6700 48.4050, 2.6700 48.3950, 2.6500 48.3950, 2.6500 48.4050))')), 4326),
   'Peuplement de hêtres en futaie, sol gréseux'),
  
  ('Île-de-France', 'Seine-et-Marne', 'Barbizon', 'Plaine de Macherin', 'Pin sylvestre', 180.7, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((2.6000 48.4400, 2.6200 48.4400, 2.6200 48.4300, 2.6000 48.4300, 2.6000 48.4400))')), 4326),
   'Pinède sur sable, régénération naturelle'),

  -- Yvelines (78)
  ('Île-de-France', 'Yvelines', 'Saint-Germain-en-Laye', 'Forêt de Saint-Germain', 'Chêne pédonculé', 890.3, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((2.0500 48.9000, 2.1000 48.9000, 2.1000 48.8800, 2.0500 48.8800, 2.0500 48.9000))')), 4326),
   'Forêt périurbaine, gestion multifonctionnelle'),
  
  ('Île-de-France', 'Yvelines', 'Rambouillet', 'Forêt de Rambouillet', 'Chêne sessile', 1520.8, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((1.8000 48.6500, 1.9000 48.6500, 1.9000 48.6200, 1.8000 48.6200, 1.8000 48.6500))')), 4326),
   'Massif forestier de production, futaie régulière'),

-- Données pour la région Nouvelle-Aquitaine
  -- Gironde (33)
  ('Nouvelle-Aquitaine', 'Gironde', 'Lacanau', 'Forêt domaniale de Lacanau', 'Pin maritime', 2150.4, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((-1.2000 44.9500, -1.1000 44.9500, -1.1000 44.9000, -1.2000 44.9000, -1.2000 44.9500))')), 4326),
   'Forêt littorale des Landes, protection dunaire'),
  
  ('Nouvelle-Aquitaine', 'Gironde', 'Hostens', 'Massif landais', 'Pin maritime', 3200.1, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((-0.7000 44.4500, -0.6000 44.4500, -0.6000 44.4000, -0.7000 44.4000, -0.7000 44.4500))')), 4326),
   'Sylviculture intensive, parcelles homogènes'),

  -- Landes (40)
  ('Nouvelle-Aquitaine', 'Landes', 'Mimizan', 'Forêt de Mimizan', 'Pin maritime', 1890.6, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((-1.3000 44.2000, -1.2000 44.2000, -1.2000 44.1500, -1.3000 44.1500, -1.3000 44.2000))')), 4326),
   'Forêt de production résineuse, sol sableux'),
  
  ('Nouvelle-Aquitaine', 'Landes', 'Biscarrosse', 'Les Grands Lacs', 'Pin maritime', 950.3, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((-1.1500 44.3500, -1.1000 44.3500, -1.1000 44.3200, -1.1500 44.3200, -1.1500 44.3500))')), 4326),
   'Zone humide forestière, écosystème lacustre'),

-- Données pour la région Auvergne-Rhône-Alpes
  -- Isère (38)
  ('Auvergne-Rhône-Alpes', 'Isère', 'Grenoble', 'Forêt de Chartreuse', 'Épicéa commun', 680.2, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((5.7000 45.2500, 5.8000 45.2500, 5.8000 45.2200, 5.7000 45.2200, 5.7000 45.2500))')), 4326),
   'Forêt de montagne, étage montagnard'),
  
  ('Auvergne-Rhône-Alpes', 'Isère', 'La Mure', 'Massif du Vercors', 'Sapin pectiné', 1120.7, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((5.8500 44.9000, 5.9500 44.9000, 5.9500 44.8700, 5.8500 44.8700, 5.8500 44.9000))')), 4326),
   'Sapinière d altitude, régénération naturelle'),
  
  ('Auvergne-Rhône-Alpes', 'Isère', 'Villard-de-Lans', 'Plateau du Vercors', 'Hêtre commun', 450.1, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((5.5500 45.0500, 5.6000 45.0500, 5.6000 45.0200, 5.5500 45.0200, 5.5500 45.0500))')), 4326),
   'Hêtraie de plateau calcaire, sous-bois clairsemé'),

-- Données pour la région Grand Est
  -- Vosges (88)
  ('Grand Est', 'Vosges', 'Épinal', 'Forêt d Épinal', 'Épicéa commun', 890.4, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((6.4500 48.2000, 6.5500 48.2000, 6.5500 48.1700, 6.4500 48.1700, 6.4500 48.2000))')), 4326),
   'Forêt vosgienne, peuplements résineux'),
  
  ('Grand Est', 'Vosges', 'Gérardmer', 'Hautes Vosges', 'Sapin pectiné', 1340.8, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((6.8000 48.0500, 6.9000 48.0500, 6.9000 48.0200, 6.8000 48.0200, 6.8000 48.0500))')), 4326),
   'Sapinière-pessière d altitude, forêt de protection'),

-- Données pour la région Occitanie
  -- Ariège (09)
  ('Occitanie', 'Ariège', 'Foix', 'Forêt de Bélesta', 'Chêne vert', 320.5, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((1.6000 42.9500, 1.6500 42.9500, 1.6500 42.9200, 1.6000 42.9200, 1.6000 42.9500))')), 4326),
   'Chênaie méditerranéenne, climat sec'),
  
  ('Occitanie', 'Ariège', 'Saint-Girons', 'Massif pyrénéen', 'Pin à crochets', 780.2, 
   ST_SetSRID(ST_Multi(ST_GeomFromText('POLYGON((1.1500 42.9800, 1.2000 42.9800, 1.2000 42.9600, 1.1500 42.9600, 1.1500 42.9800))')), 4326),
   'Pin de montagne, forêt subalpine');