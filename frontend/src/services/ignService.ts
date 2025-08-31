import client from '@/lib/apollo-client';
import { gql } from '@apollo/client';

// Define TypeScript types for the GraphQL responses
type Forest = {
  id: string;
  region?: string;
  department?: string;
  commune?: string;
  lieuxdit?: string;
  treeSpecies?: string;
  surfaceArea?: number;
  geometry?: any;
  description?: string;
};

type Cadastral = {
  id: string;
  region?: string;
  department?: string;
  commune?: string;
  lieuxdit?: string;
  geometry?: any;
  description?: string;
};

type GetForestDataResult = { forests: Forest[] };
type GetCadastralDataResult = { cadastralData: Cadastral[] };
type ForestFilters = Record<string, unknown>;

// Requête GraphQL pour récupérer les données de la table forest_data
const GET_FOREST_DATA = gql`
  query GetForestData($filters: ForestFilterInput) {
    forests(filters: $filters) {
      id
      region
      department
      commune
      lieuxdit
      treeSpecies
      surfaceArea
      geometry
      description
    }
  }
`;

// Requête GraphQL pour récupérer les données de la table cadastre_parcels
const GET_CADASTRE_DATA = gql`
  query GetCadastralData {
    cadastralData {
      id
      region
      department
      commune
      lieuxdit
      geometry
      description
    }
  }
`;

export async function fetchForestData(filters: ForestFilters) {
  try {
    const { data } = await client.query<GetForestDataResult, { filters?: ForestFilters }>({
      query: GET_FOREST_DATA,
      variables: { filters },
      fetchPolicy: 'network-only',
    });
    return data?.forests ?? [];
  } catch (error) {
    console.error('Error fetching forest data:', error);
    throw error;
  }
}

export async function fetchCadastralData() {
  try {
    const { data } = await client.query<GetCadastralDataResult>({
      query: GET_CADASTRE_DATA,
      fetchPolicy: 'network-only',
    });
    return data?.cadastralData ?? [];
  } catch (error) {
    console.error('Error fetching cadastral data:', error);
    throw error;
  }
}

// Nouvelle méthode pour récupérer les données BD Forêt depuis la base locale
export async function fetchLocalBDForetData() {
  try {
    const response = await fetch('/database/data/bdforet.json'); // Chemin vers les données mockées
    if (!response.ok) {
      throw new Error(`Failed to fetch local BD Forêt data: ${response.statusText}`);
    }
    return (await response.json()) as Forest[];
  } catch (error) {
    console.error('Error fetching local BD Forêt data:', error);
    throw error;
  }
}

// Nouvelle méthode pour récupérer les données cadastrales depuis la base locale
export async function fetchLocalCadastralData() {
  try {
    const response = await fetch('/database/data/cadastre.json'); // Chemin vers les données mockées
    if (!response.ok) {
      throw new Error(`Failed to fetch local cadastral data: ${response.statusText}`);
    }
    return (await response.json()) as Cadastral[];
  } catch (error) {
    console.error('Error fetching local cadastral data:', error);
    throw error;
  }
}
