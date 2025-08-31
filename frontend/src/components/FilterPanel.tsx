'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DEPARTMENTS, GET_COMMUNES, GET_TREE_SPECIES, GET_LIEUX_DITS } from '@/graphql/queries';

interface FilterPanelProps {
  regions: string[];
  currentFilters: {
    region?: string;
    department?: string;
    commune?: string;
    treeSpecies?: string;
    lieuxdit?: string;
  };
  onFiltersChange: (filters: { region?: string; department?: string; commune?: string; treeSpecies?: string; lieuxdit?: string }) => void;
}

export default function FilterPanel({ regions, currentFilters, onFiltersChange }: FilterPanelProps) {
  console.log("regions", regions)
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedCommune, setSelectedCommune] = useState<string>('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const [selectedLieuxDit, setSelectedLieuxDit] = useState<string>('');

  // Requêtes pour la navigation hiérarchique
  const { data: departmentsData }: { data?: { departments: [] } } = useQuery(GET_DEPARTMENTS, {
    variables: { region: selectedRegion },
    skip: !selectedRegion
  });

  const { data: communesData }: { data?: { communes: [] } } = useQuery(GET_COMMUNES, {
    variables: { department: selectedDepartment },
    skip: !selectedDepartment
  });

  const { data: lieuxDitsData }: { data?: { lieuxDits: [] } } = useQuery(GET_LIEUX_DITS, {
    variables: { commune: selectedCommune },
    skip: !selectedCommune
  });

  const { data: treeSpeciesData }: { data?: { treeSpecies: [] } } = useQuery(GET_TREE_SPECIES);

  const departments = departmentsData?.departments || [];
  const communes = communesData?.communes || [];
  const lieuxDits = lieuxDitsData?.lieuxDits || [];
  const treeSpecies = treeSpeciesData?.treeSpecies || [];

  // Synchroniser les filtres locaux avec les filtres parents
  useEffect(() => {
    setSelectedRegion(currentFilters.region || '');
    setSelectedDepartment(currentFilters.department || '');
    setSelectedCommune(currentFilters.commune || '');
    setSelectedSpecies(currentFilters.treeSpecies || '');
    setSelectedLieuxDit(currentFilters.lieuxdit || '');
  }, [currentFilters]);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedDepartment('');
    setSelectedCommune('');
    setSelectedLieuxDit('');
    
    const newFilters = {
      ...currentFilters,
      region: region || undefined,
      department: undefined,
      commune: undefined,
      lieuxdit: undefined
    };
    onFiltersChange(newFilters);
  };

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
    setSelectedCommune('');
    setSelectedLieuxDit('');
    
    const newFilters = {
      ...currentFilters,
      department: department || undefined,
      commune: undefined,
      lieuxdit: undefined
    };
    onFiltersChange(newFilters);
  };

  const handleCommuneChange = (commune: string) => {
    setSelectedCommune(commune);
    setSelectedLieuxDit('');
    
    const newFilters = {
      ...currentFilters,
      commune: commune || undefined,
      lieuxdit: undefined
    };
    onFiltersChange(newFilters);
  };

  const handleLieuxDitChange = (lieuxDit: string) => {
    setSelectedLieuxDit(lieuxDit);
    
    const newFilters = {
      ...currentFilters,
      lieuxdit: lieuxDit || undefined
    };
    onFiltersChange(newFilters);
  };

  const handleSpeciesChange = (species: string) => {
    setSelectedSpecies(species);
    
    const newFilters = {
      ...currentFilters,
      treeSpecies: species || undefined
    };
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    setSelectedRegion('');
    setSelectedDepartment('');
    setSelectedCommune('');
    setSelectedSpecies('');
    setSelectedLieuxDit('');
    onFiltersChange({});
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-green-800">
          🗺️ Navigation BD Forêt®
        </h2>
        {(selectedRegion || selectedDepartment || selectedCommune || selectedSpecies || selectedLieuxDit) && (
          <button
            onClick={resetFilters}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Sélection Région */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏛️ Région
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Toutes les régions</option>
            {
            regions.map((region: string, i: number) => (
              <option key={`${region?? 'region'}-${i}`} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Sélection Département */}
        {selectedRegion && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏢 Département
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Tous les départements</option>
              {departments.map((department: [], i: number) => (
                <option key={`${department?? 'department'}-${i}`} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sélection Commune */}
        {selectedDepartment && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏘️ Commune
            </label>
            <select
              value={selectedCommune}
              onChange={(e) => handleCommuneChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Toutes les communes</option>
              {communes.map((commune: [], i: number) => (
                <option key={`${commune?? 'commune'}-${i}`} value={commune}>
                  {commune}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sélection Lieux-dit */}
        {selectedCommune && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏞️ Lieux-dit
            </label>
            <select
              value={selectedLieuxDit}
              onChange={(e) => handleLieuxDitChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Tous les lieux-dits</option>
              {lieuxDits.map((lieuxDit: [], i: number) => (
                <option key={`${lieuxDit ?? 'lieuxDit'}-${i}`} value={lieuxDit}>
                  {lieuxDit}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sélection Espèce */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🌳 Espèce d&apos;arbre
          </label>
          <select
            value={selectedSpecies}
            onChange={(e) => handleSpeciesChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Toutes les espèces</option>
            {treeSpecies.map((species: [], i: number) => (
              <option key={`${species ?? 'species'}-${i}`} value={species}>
                {species}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Résumé des filtres actifs */}
      {(selectedRegion || selectedDepartment || selectedCommune || selectedSpecies || selectedLieuxDit) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Filtres actifs :</p>
          <div className="space-y-1">
            {selectedRegion && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                Région: {selectedRegion}
              </span>
            )}
            {selectedDepartment && (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-1">
                Département: {selectedDepartment}
              </span>
            )}
            {selectedCommune && (
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded ml-1">
                Commune: {selectedCommune}
              </span>
            )}
            {selectedLieuxDit && (
              <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded ml-1">
                Lieux-dit: {selectedLieuxDit}
              </span>
            )}
            {selectedSpecies && (
              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded ml-1">
                Espèce: {selectedSpecies}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}