'use client';
import { useEffect, useState } from 'react';
import { GET_REGIONS, GET_FORESTS, GET_FOREST_STATISTICS } from '@/graphql/queries';
import FilterPanel from '@/components/FilterPanel';
import ForestMap from '@/components/ForestMap';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { AuthModal } from '@/components/AuthModal';

const GET_MAP_STATE = gql`
  query GetMapState {
    getMapState {
      lastMapLat
      lastMapLng
      lastMapZoom
      lastMapFilters
    }
  }
`;

const SAVE_MAP_STATE = gql`
  mutation SaveMapState($mapPosition: JSON, $mapZoom: Float, $mapFilters: JSON) {
    saveMapState(mapPosition: $mapPosition, mapZoom: $mapZoom, mapFilters: $mapFilters)
  }
`;

interface ForestFilters {
  region?: string;
  department?: string;
  commune?: string;
  treeSpecies?: string;
  lieuxdit?: string;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [filters, setFilters] = useState<ForestFilters>({});
  const [mapStateLoaded, setMapStateLoaded] = useState(false);
  const [mapPosition, setMapPosition] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Vérifier l'authentification au chargement
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Récupérer l'état de la carte à la connexion
  const { data: mapStateData, refetch: refetchMapState } = useQuery<{ getMapState: { lastMapLat: number; lastMapLng: number; lastMapZoom: number; lastMapFilters: ForestFilters } }>(GET_MAP_STATE, {
    skip: !isAuthenticated
  });

  useEffect(() => {
    if (mapStateData?.getMapState) {
      const { lastMapLat, lastMapLng, lastMapZoom, lastMapFilters } = mapStateData.getMapState;
      if (lastMapFilters) setFilters(lastMapFilters);
      if (lastMapLat && lastMapLng) setMapPosition({ lat: lastMapLat, lng: lastMapLng });
      if (lastMapZoom) setMapZoom(lastMapZoom);
      setMapStateLoaded(true);
    } else if (mapStateData) {
      setMapStateLoaded(true);
    }
  }, [mapStateData]);

  useEffect(() => {
    if (!mapStateLoaded && mapStateData === undefined) {
      setMapStateLoaded(true);
    }
  }, [mapStateData, mapStateLoaded]);
  // Sauvegarder l'état de la carte/filtre à chaque changement
  const [saveMapState] = useMutation(SAVE_MAP_STATE);
  useEffect(() => {
    if (isAuthenticated && mapStateLoaded) {
      saveMapState({
        variables: {
          mapPosition: mapPosition ?? null, // à remplacer par la position réelle si besoin
          mapZoom: mapZoom ?? null,         // à remplacer par le zoom réel si besoin
          mapFilters: filters
        }
      });
    }
  }, [filters, isAuthenticated, mapStateLoaded, saveMapState, mapPosition, mapZoom]);

  // Requêtes GraphQL
  const { data: regionsData, loading: regionsLoading, error: regionsError } = useQuery<{ regions: never[] }>(GET_REGIONS, {
    skip: !isAuthenticated
  });

  const { data: forestsData, loading: forestsLoading, error: forestsError } = useQuery<{ forests: never[] }>(GET_FORESTS, {
    variables: { filters },
    skip: !isAuthenticated
  });

  const { data: statsData,  } = useQuery<{ forestStatistics: { count: number; totalArea: number; averageArea: number } }>(GET_FOREST_STATISTICS, {
    variables: { filters },
    skip: !isAuthenticated
  });

  const regions = regionsData?.regions || [];
  const forests = forestsData?.forests || [];
  const statistics = statsData?.forestStatistics || { count: 0, totalArea: 0, averageArea: 0 };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
    setMapStateLoaded(false);
    refetchMapState();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setFilters({});
  };

  if (!isAuthenticated || !mapStateLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-4">
              🌲 BD Forêt® Viewer
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Visualiseur de données forestières françaises
            </p>
            <p className="text-sm text-gray-500">
              Base de Données Forestières de l&apos;IGN
            </p>
          </div>
          
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Se connecter pour accéder aux données
          </button>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  if (regionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données forestières...</p>
        </div>
      </div>
    );
  }

  if (regionsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur de connexion au backend</p>
          <button
            onClick={handleLogout}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-green-800">
                🌲 BD Forêt® Viewer
              </h1>
              <p className="text-sm text-gray-600">
                Données forestières françaises • IGN V2
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filtres */}
          <div className="lg:col-span-1">
            <FilterPanel
              regions={regions}
              currentFilters={filters}
              onFiltersChange={setFilters}
            />

            {/* Statistiques */}
            {statistics && (
              <div className="mt-6 bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  📊 Statistiques
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Parcelles :</span>
                    <span className="font-mono">{statistics?.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surface totale :</span>
                    <span className="font-mono">{statistics?.totalArea?.toLocaleString()} ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surface moyenne :</span>
                    <span className="font-mono">{statistics?.averageArea?.toFixed(1)} ha</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content - Carte */}
          <div className="lg:col-span-3">
            {forestsLoading ? (
              <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement de la carte...</p>
                </div>
              </div>
            ) : forestsError ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-red-600">Erreur lors du chargement des données forestières</p>
              </div>
            ) : (
              <ForestMap
                forestData={forests}
                filters={filters}
                mapPosition={mapPosition}
                mapZoom={mapZoom}
                onMapStateChange={({ mapPosition, mapZoom }) => {
                  setMapPosition(mapPosition);
                  setMapZoom(mapZoom);
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
