/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import { fetchBDForetData, fetchCadastralData } from '../services/ignService';
import Supercluster from 'supercluster';

// Define the SubmitPolygonResponse interface
interface SubmitPolygonResponse {
  submitPolygon: {
    success: boolean;
    message: string;
    stats?: {
      area: number;
      perimeter: number;
    };
  };
}
import { useMutation, useQuery, useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

// Types pour les données BD Forêt®
interface ForestData {
  id: string;
  region: string;
  department: string;
  commune: string;
  treeSpecies: string;
  area: number;
  year: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface MapFilters {
  year?: number;
  species?: string[];
  minArea?: number;
  maxArea?: number;
  region?: string;
}

interface ForestMapProps {
  forestData: ForestData[];
  selectedData?: ForestData | null;
  onDataSelect?: (data: ForestData | null) => void;
  filters?: MapFilters;
  onFilterChange?: (filters: MapFilters) => void;
  mapPosition?: { lat: number; lng: number };
  mapZoom?: number;
  onMapStateChange?: (state: { mapPosition: { lat: number; lng: number }; mapZoom: number }) => void;
}

interface HierarchicalNavigation {
  region?: string;
  department?: string;
  commune?: string;
  lieuDit?: string;
}

import { IGN_CONFIG } from '../config/ignConfig';
import React from 'react';

const GET_FORESTS_BY_BBOX = gql`
  query GetForestsByBBox($bbox: [Float!]!) {
    forestsByBBox(bbox: $bbox) {
      id
      region
      department
      commune
      treeSpecies
      surfaceArea
      centroid
      geometry
      description
    }
  }
`;

interface SpeciesArea {
  species: string;
  areaHa: number;
}

interface ParcelInfo {
  id: string;
  lieuxdit?: string | null;
}

interface PolygonStats {
  totalArea: number;
  parcelCount: number;
  treeSpecies: string[];
  speciesBreakdown: SpeciesArea[];
  parcels: ParcelInfo[];
}

export default function ForestMap({ 
  forestData = [], // Provide default empty array
  selectedData, 
  onDataSelect,
  filters = {},
  onFilterChange,
  mapPosition,
  mapZoom,
  onMapStateChange
}: ForestMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const [hoveredData, setHoveredData] = useState<ForestData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [clusters, setClusters] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [navigation, setNavigation] = useState<HierarchicalNavigation>({});
  const [zoomLevel, setZoomLevel] = useState<number>(5);
  const [polygonStats, setPolygonStats] = useState<PolygonStats | null>(null);

  const SUBMIT_POLYGON_MUTATION = gql`
    mutation SubmitPolygon($geojson: String!) {
      submitPolygon(geojson: $geojson) {
        totalArea
        parcelCount
        treeSpecies
        speciesBreakdown {
          species
          areaHa
        }
        parcels {
          id
          lieuxdit
        }
      }
    }
  `;

  const [submitPolygon] = useMutation<{ submitPolygon: PolygonStats }>(SUBMIT_POLYGON_MUTATION);
  const GET_MAP_STATE = gql`
    query GetMapState {
      getMapState {
        mapPosition
        mapZoom
      }
    }
  `;

  const { data: mapStateData } = useQuery<{ getMapState?: { mapPosition: [number, number]; mapZoom: number } }>(GET_MAP_STATE);
  const [fetchForestsByBBox, { data: bboxData }] = useLazyQuery<{ forestsByBBox: Array<{ id: string; region: string; department: string; commune: string; treeSpecies: string; surfaceArea: number; centroid?: any; geometry?: any; description?: string; }> }>(GET_FORESTS_BY_BBOX, { fetchPolicy: 'network-only' });

  // Fonction pour créer des clusters de markers
  const createClusters = useCallback(() => {
    if (!mapInstance.current || !forestData.length) return;
    
    const supercluster = new Supercluster({
      radius: 40,
      maxZoom: 16,
    });
    
    const points = forestData
      .filter(forest => forest.coordinates)
      .map(forest => ({
        type: "Feature" as const, // Explicitly set type to "Feature"
        properties: { ...forest },
        geometry: {
          type: "Point" as const,
          coordinates: [forest.coordinates!.lng, forest.coordinates!.lat],
        },
      }));

    // Supercluster typings are strict; cast to any to avoid type mismatch
    supercluster.load(points as any);
    setClusters(points);
  }, [forestData]);

  // Fonction pour créer le contenu du popup (déclarée tôt car utilisée par updateMapMarkers)
  const createPopupContent = useCallback((forest: ForestData) => {
    return new maplibregl.Popup().setHTML(`
      <div class="forest-popup">
        <h3 class="font-bold">${forest.treeSpecies}</h3>
        <div class="text-sm">
          <p>Surface: ${forest.area.toLocaleString()} ha</p>
          <p>Commune: ${forest.commune}</p>
          <p>Année: ${forest.year}</p>
        </div>
      </div>
    `);
  }, []);

  // Fonction pour mettre à jour les markers sur la carte (déclarée tôt car utilisée par d'autres callbacks)
  const updateMapMarkers = useCallback((data: ForestData[]) => {
    if (!mapInstance.current) return;

    // Supprimer les markers existants
    const markers = document.getElementsByClassName('maplibregl-marker');
    while(markers[0]) {
      markers[0].remove();
    }

    // Ajouter les nouveaux markers
    data.forEach(forest => {
      if (forest?.coordinates?.lat && forest?.coordinates?.lng) {
        new maplibregl.Marker()
          .setLngLat([forest.coordinates.lng, forest.coordinates.lat])
          .setPopup(createPopupContent(forest))
          .addTo(mapInstance.current!);
      }
    });
  }, [createPopupContent]);

  // SAVE_MAP_STATE helper (kept as useCallback)
  const SAVE_MAP_STATE = useCallback(async ({
    variables: { mapPosition, mapZoom, mapFilters },
  }: {
    variables: {
      mapPosition: { lat: number; lng: number };
      mapZoom: number;
      mapFilters: Record<string, unknown>;
    };
  }) => {
    try {
      const response = await fetch('/api/map-state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapPosition,
          mapZoom,
          mapFilters,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save map state: ${response.statusText}`);
      }

      console.log('Map state saved successfully');
    } catch (error) {
      console.error('Error saving map state:', error);
    }
  }, []);

  // updateMapData helper used by hierarchical loading
  const updateMapData = useCallback((features: any) => {
    if (!mapInstance.current) return;

    const fd = features.map((feature: any) => ({
      id: feature.id,
      region: feature.properties?.region,
      department: feature.properties?.department,
      commune: feature.properties?.commune,
      treeSpecies: feature.properties?.treeSpecies,
      area: feature.properties?.area,
      year: feature.properties?.year,
      coordinates: feature.geometry && feature.geometry.type === 'Point' ? {
        lng: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1]
      } : undefined
    }));

    updateMapMarkers(fd);
  }, [updateMapMarkers]);

  // loadCadastralData helper (used by zoom handler)
  const loadCadastralData = useCallback(() => {
    if (!mapInstance.current) return;

    const bounds = mapInstance.current.getBounds();
    fetchCadastralData({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    }).then(data => {
      if (mapInstance.current?.getSource('cadastral-source')) {
        (mapInstance.current.getSource('cadastral-source') as maplibregl.GeoJSONSource)
          .setData(data);
      }
    }).catch(error => {
      console.error('Error loading cadastral data:', error);
      setError('Erreur lors du chargement des données cadastrales');
    });
  }, []);

  // Fonction pour appliquer les filtres (peut maintenant utiliser updateMapMarkers)
  const applyFilters = useCallback((currentFilters: MapFilters) => {
    const filteredData = forestData.filter(forest => {
      if (currentFilters.year && forest.year !== currentFilters.year) return false;
      if (currentFilters.minArea && forest.area < currentFilters.minArea) return false;
      if (currentFilters.maxArea && forest.area > currentFilters.maxArea) return false;
      if (currentFilters.species?.length && !currentFilters.species.includes(forest.treeSpecies)) return false;
      if (currentFilters.region && forest.region !== currentFilters.region) return false;
      return true;
    });

    updateMapMarkers(filteredData);
    onFilterChange?.(currentFilters);
  }, [forestData, onFilterChange, updateMapMarkers]);

  // Fonction de recherche
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const results = forestData.filter(forest => 
      forest.commune.toLowerCase().includes(query.toLowerCase()) ||
      forest.treeSpecies.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length && results[0].coordinates) {
      mapInstance.current?.flyTo({
        center: [results[0].coordinates.lng, results[0].coordinates.lat],
        zoom: 12
      });
    }
  }, [forestData]);

  // Ajout des gestionnaires d'erreurs
  useEffect(() => {
    if (!mapInstance.current) return;

    const handleMapError = (e: ErrorEvent) => {
      setError(`Erreur de carte: ${e.error.message}`);
      console.error('Map error:', e.error);
    };

    mapInstance.current.on('error', handleMapError);

    return () => {
      mapInstance.current?.off('error', handleMapError);
    };
  }, []);

  // Fonction pour gérer la navigation hiérarchique
  const handleHierarchicalNavigation = useCallback((level: keyof HierarchicalNavigation, value: string) => {
    setNavigation(prev => {
      const newNav = { ...prev, [level]: value };
      // Réinitialiser les niveaux inférieurs
      const levels: (keyof HierarchicalNavigation)[] = ['region', 'department', 'commune', 'lieuDit'];
      const currentIndex = levels.indexOf(level);
      levels.slice(currentIndex + 1).forEach(l => delete newNav[l]);
      return newNav;
    });

    // Ajuster le zoom selon le niveau
    const zoomLevels = {
      region: 8,
      department: 10,
      commune: 12,
      lieuDit: 14
    };
    mapInstance.current?.setZoom(zoomLevels[level]);
  }, []);

  // Gérer les couches selon le zoom
  const handleZoomChange = useCallback(() => {
    const zoom = mapInstance.current?.getZoom() || 5;
    setZoomLevel(zoom);

    // Gérer la visibilité des couches
    if (mapInstance.current) {
      const layers = {
        'forest-layer': zoom >= 8,
        'cadastral-layer': zoom >= 12,
        'lieu-dit-layer': zoom >= 14
      };

      Object.entries(layers).forEach(([layer, visible]) => {
        if (mapInstance.current?.getLayer(layer)) {
          mapInstance.current.setLayoutProperty(
            layer,
            'visibility',
            visible ? 'visible' : 'none'
          );
        }
      });
    }
  }, []);

  // Ajouter au useEffect principal
  useEffect(() => {
    if (!mapInstance.current) return;

    // Ajouter l'écouteur de zoom
    mapInstance.current.on('zoom', handleZoomChange);

    // Charger les données cadastrales
    mapInstance.current.on('moveend', async () => {
      if (zoomLevel >= 12) {
        const bounds = mapInstance.current?.getBounds();
        if (bounds) {
          try {
            const cadastralData = await fetchCadastralData({
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest()
            });

            if (mapInstance.current?.getSource('cadastral-source')) {
              (mapInstance.current.getSource('cadastral-source') as maplibregl.GeoJSONSource)
                .setData(cadastralData);
            }
          } catch (error) {
            console.error('Error loading cadastral data:', error);
          }
        }
      }
    });

    return () => {
      mapInstance.current?.off('zoom', handleZoomChange);
    };
  }, [handleZoomChange, zoomLevel]);

  // Composant de légende
  const Legend = () => (
    <div className="absolute bottom-8 right-8 bg-white p-4 rounded-lg shadow-lg">
      <h4 className="font-bold mb-2">Légende</h4>
      <div className="space-y-2">
        {Array.from(new Set(forestData.map(d => d.treeSpecies))).map(species => (
          <div key={species} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getSpeciesColor(species) }} />
            <span className="text-sm">{species}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Ajouter à la section du rendu pour la navigation hiérarchique
  const NavigationBreadcrumb = () => (
    <div className="px-4 py-2 bg-gray-100 flex gap-2 items-center text-sm">
      {Object.entries(navigation).map(([level, value], index) => (
        <React.Fragment key={level}>
          {index > 0 && <span className="text-gray-400">/</span>}
          <button
            onClick={() => handleHierarchicalNavigation(level as keyof HierarchicalNavigation, value)}
            className="text-green-700 hover:underline"
          >
            {value}
          </button>
        </React.Fragment>
      ))}
    </div>
  );

  // Ajout de la gestion des couches IGN
  const setupIGNLayers = useCallback(() => {
    if (!mapInstance.current) return;

    // Couche BD Forêt
    mapInstance.current.addSource('bdforet-source', {
      type: 'raster',
      tiles: [
        `${IGN_CONFIG.wmsUrl}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${IGN_CONFIG.layers.bdForet}&FORMAT=image/png&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}`
      ],
      tileSize: 256
    });

    // Cadastre: use a GeoJSON source (start empty) and populate with WFS responses via setData()
    mapInstance.current.addSource('cadastral-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Ajout des couches avec visibilité conditionnelle
    mapInstance.current.addLayer({
      id: 'bdforet-layer',
      type: 'raster',
      source: 'bdforet-source',
      minzoom: 8,
      layout: {
        visibility: 'none'
      }
    });

    mapInstance.current.addLayer({
      id: 'cadastre-layer',
      type: 'fill',
      source: 'cadastral-source',
      minzoom: 12,
      paint: {
        'fill-color': '#888888',
        'fill-opacity': 0.4,
        'fill-outline-color': '#666666'
      },
      layout: {
        visibility: 'none'
      }
    });
  }, []);

  // Amélioration de la navigation hiérarchique
  const loadHierarchicalData = useCallback(async (level: keyof HierarchicalNavigation, value: string) => {
    if (!mapInstance.current) return;

    const bounds = mapInstance.current.getBounds();
    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ].join(',');

    try {
      const response = await fetch(
        `${IGN_CONFIG.wfsUrl}?` +
        `SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&` +
        `TYPENAME=${IGN_CONFIG.layers.bdForet}&` +
        `BBOX=${bbox}&` +
        `CQL_FILTER=${level}='${value}'&` +
        `outputFormat=application/json`
      );

      if (!response.ok) throw new Error('Erreur lors du chargement des données');

      const data = await response.json();
      updateMapData(data.features);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      setError('Erreur lors du chargement des données hiérarchiques');
    }
  }, [updateMapData]);

  // Mise à jour du gestionnaire de zoom
  useEffect(() => {
    if (!mapInstance.current) return;

    const handleZoom = () => {
      const zoom = mapInstance.current?.getZoom() || 0;
      
      // Gestion des couches selon le niveau de zoom
      const layers = {
        'bdforet-layer': zoom >= 8,
        'cadastre-layer': zoom >= 12
      };

      Object.entries(layers).forEach(([layerId, isVisible]) => {
        if (mapInstance.current?.getLayer(layerId)) {
          mapInstance.current.setLayoutProperty(
            layerId,
            'visibility',
            isVisible ? 'visible' : 'none'
          );
        }
      });

      // Chargement des données détaillées si nécessaire
      if (zoom >= 12) {
        loadCadastralData();
      }
    };

    mapInstance.current.on('zoom', handleZoom);
    return () => {
      mapInstance.current?.off('zoom', handleZoom);
    };
  }, [loadHierarchicalData, loadCadastralData]);

  useEffect(() => {
    if (!bboxData?.forestsByBBox) return;
    const mapped = mapBackendRowsToForestData(bboxData.forestsByBBox);
    updateMapMarkers(mapped);
  }, [bboxData, updateMapMarkers]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    try {
      // Initialize MapLibre GL JS map
      mapInstance.current = new maplibregl.Map({
        container: mapRef.current,
        style: 'https://demotiles.maplibre.org/style.json',
        center: (mapPosition && mapPosition.lng && mapPosition.lat) ? [mapPosition.lng, mapPosition.lat] : (mapStateData?.getMapState?.mapPosition || [2.2137, 46.2276]),
        zoom: mapZoom ?? mapStateData?.getMapState?.mapZoom ?? 5,
      });

      // Check if map was initialized correctly
      if (!mapInstance.current) {
        throw new Error('Failed to initialize map');
      }

      mapInstance.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Add forest data markers with null checks
      forestData.forEach((forest) => {
        if (forest?.coordinates?.lat && forest?.coordinates?.lng) {
          const marker = new maplibregl.Marker()
            .setLngLat([forest.coordinates.lng, forest.coordinates.lat])
            .setPopup(
              new maplibregl.Popup().setHTML(
                `<strong>${forest.treeSpecies || 'Unknown species'}</strong><br>Surface: ${forest.area || 'N/A'} ha`
              )
            );
          marker.addTo(mapInstance.current!);
        }
      });

      // Run setup and add controls once the map style is fully loaded.
      // Important: adding sources/layers or MapboxDraw before style load can cause errors
      // (and mapbox:// vector URLs are not supported by MapLibre). We therefore
      // perform IGN layer setup and draw control initialization inside the 'load' event.
      mapInstance.current.on('load', () => {
        try {
          // Setup IGN WMS / WFS layers (uses our setupIGNLayers helper)
          setupIGNLayers();

          // Initialize MapboxDraw after style is ready to avoid invalid expression errors
          const draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
              polygon: true,
              trash: true,
            },
          });
          mapInstance.current?.addControl(draw);

          // Listen for draw.create events (register handler here since draw exists now)
          mapInstance.current?.on('draw.create', (e: any) => {
            if (e.features?.[0]) {
              const feature = e.features[0];
              const geojsonStr = JSON.stringify(feature);

              submitPolygon({ variables: { geojson: geojsonStr } })
                .then((res) => {
                  const stats = res?.data?.submitPolygon;
                  if (stats) setPolygonStats(stats);
                })
                .catch(error => {
                  console.error('Error submitting polygon:', error);
                  alert('Failed to submit polygon');
                });
            }
          });

          // Sanitize any MapboxDraw-added layer paint expressions that MapLibre rejects.
          // MapboxDraw may add line-dasharray as a nested numeric array; MapLibre requires
          // literal arrays expressed as ["literal", [...]] when parsing style expressions.
          // Corriger les propriétés de style incompatibles ajoutées par MapboxDraw
const style = mapInstance.current?.getStyle();
if (style?.layers && mapInstance.current) {
  style.layers.forEach((layer: any) => {
    if (layer?.id && layer.id.startsWith('gl-draw')) {
      try {
        const dash = mapInstance.current!.getPaintProperty(layer.id, 'line-dasharray');
        if (Array.isArray(dash)) {
          // MapLibre attend ["literal", [..]] et pas [..]
          mapInstance.current!.setPaintProperty(layer.id, 'line-dasharray', ["literal", dash]);
        }
      } catch (err) {
        // ignorer les erreurs sur les couches qui n'ont pas line-dasharray
      }
    }
  });
}
        } catch (error) {
          console.error('Error during map load setup:', error);
        }
      });

      mapInstance.current.on('moveend', () => {
        if (onMapStateChange && mapInstance.current) {
          const center = mapInstance.current.getCenter();
          const zoom = mapInstance.current.getZoom();
          onMapStateChange({
            mapPosition: { lat: center.lat, lng: center.lng },
            mapZoom: zoom
          });
        }
      });

      mapInstance.current.on('zoomend', () => {
        if (onMapStateChange && mapInstance.current) {
          const center = mapInstance.current.getCenter();
          const zoom = mapInstance.current.getZoom();
          onMapStateChange({
            mapPosition: { lat: center.lat, lng: center.lng },
            mapZoom: zoom
          });
        }
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      try {
        mapInstance.current?.remove();
      } catch (error) {
        console.error('Error cleaning up map:', error);
      } finally {
        mapInstance.current = null;
      }
    };
  }, [forestData, mapStateData, SAVE_MAP_STATE, submitPolygon, setupIGNLayers, fetchForestsByBBox, mapPosition, mapZoom, onMapStateChange]);

  // Regrouper les données par région pour l'affichage
  const dataByRegion = forestData.reduce((acc, data) => {
    if (data && data.region) {
      if (!acc[data.region]) {
        acc[data.region] = [];
      }
      acc[data.region].push(data);
    }
    return acc;
  }, {} as Record<string, ForestData[]>);

  const regions = Object.keys(dataByRegion);

  const handleRegionClick = (region: string) => {
    const regionData = dataByRegion[region];
    if (regionData && regionData.length > 0) {
      onDataSelect?.(regionData[0]); // Sélectionner la première parcelle de la région
    }
  };

  const handleRegionHover = (region: string, isHovering: boolean) => {
    if (isHovering) {
      const regionData = dataByRegion[region];
      if (regionData && regionData.length > 0) {
        setHoveredData(regionData[0]);
      }
    } else {
      setHoveredData(null);
    }
  };

  // Helper to convert backend rows to ForestData expected by this component
  const mapBackendRowsToForestData = (rows: any[]): ForestData[] => {
    return rows.map(r => ({
      id: r.id,
      region: r.region,
      department: r.department,
      commune: r.commune,
      treeSpecies: r.treeSpecies || r.tree_species,
      area: r.surfaceArea || r.surface_area || 0,
      year: r.year || new Date().getFullYear(),
      coordinates: (() => {
        try {
          const geo = r.centroid ? JSON.parse(r.centroid) : (r.geometry ? JSON.parse(r.geometry) : null);
          if (geo && geo.type === 'Point') return { lng: geo.coordinates[0], lat: geo.coordinates[1] };
        } catch (e) {}
        return undefined;
      })(),
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* En-tête de la carte */}
      <div className="bg-green-600 text-white px-4 py-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          🗺️ Carte BD Forêt® - France
          <span className="text-sm font-normal opacity-90">
            ({forestData.length} parcelles forestières)
          </span>
        </h3>
      </div>

      {/* Navigation hiérarchique */}
      <NavigationBreadcrumb />

      {/* Barre de recherche */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Rechercher une commune ou une espèce..."
          className="w-full px-4 py-2 border rounded-lg"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Zone de la carte */}
      <div className="relative">
        <div 
          ref={mapRef}
          className="h-96 w-full relative overflow-hidden"
        />

        {/* Panneau d'information sur survol */}
        {hoveredData && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
            <h4 className="font-semibold text-green-800 mb-2">
              📍 {hoveredData.region} - {hoveredData.department}
            </h4>
            <div className="space-y-1 text-sm">
              <div>🏘️ Commune: {hoveredData?.commune}</div>
              <div>🌳 Espèce: {hoveredData?.treeSpecies}</div>
              <div>📏 Surface: {hoveredData?.area ? hoveredData?.area?.toLocaleString() : 'N/A'} ha</div>
              <div>📅 Année: {hoveredData?.year}</div>
            </div>
          </div>
        )}

        {/* Panneau d'information sur le polygon dessiné */}
        {polygonStats && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-md max-h-72 overflow-auto">
            <h4 className="font-semibold text-green-800 mb-2">Polygon analysis</h4>
            <div className="text-sm mb-2">Total area: {polygonStats.totalArea.toFixed(2)} ha</div>
            <div className="text-sm mb-2">Parcels intersecting: {polygonStats.parcelCount}</div>
            <div className="text-sm mb-2">Tree species present:</div>
            <ul className="text-sm list-disc list-inside mb-2">
              {polygonStats.treeSpecies.map(s => <li key={s}>{s}</li>)}
            </ul>
            <div className="text-sm font-semibold">Breakdown (ha):</div>
            <ul className="text-sm list-disc list-inside mb-2">
              {polygonStats.speciesBreakdown.map(sb => (
                <li key={sb.species}>{sb.species}: {sb.areaHa.toFixed(2)} ha</li>
              ))}
            </ul>
            <div className="text-sm font-semibold">Parcels:</div>
            <ul className="text-sm list-disc list-inside">
              {polygonStats.parcels.map(p => (
                <li key={p.id}>{p.id} {p.lieuxdit ? `- ${p.lieuxdit}` : ''}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Affichage des erreurs */}
        {error && (
          <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Légende */}
        <Legend />
      </div>

      {/* Statistiques en bas de carte */}
      <div className="bg-gray-50 px-4 py-3 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">
              {regions.length}
            </div>
            <div className="text-xs text-gray-600">Régions</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {new Set(forestData.map(d => d.department)).size}
            </div>
            <div className="text-xs text-gray-600">Départements</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {new Set(forestData.map(d => d.commune)).size}
            </div>
            <div className="text-xs text-gray-600">Communes</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {new Set(forestData.map(d => d.treeSpecies)).size}
            </div>
            <div className="text-xs text-gray-600">Espèces</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fonction utilitaire pour obtenir une couleur par espèce
const getSpeciesColor = (species: string): string => {
  const colors: Record<string, string> = {
    'Chêne': '#2E7D32',
    'Pin': '#1B5E20',
    'Hêtre': '#33691E',
    // Ajouter d'autres espèces selon les besoins
  };
  return colors[species] || '#4CAF50';
};

