
import { gql } from '@apollo/client';

// Requêtes pour la navigation hiérarchique BD Forêt®
export const GET_REGIONS = gql`
  query GetRegions {
    regions
  }
`;

export const GET_DEPARTMENTS = gql`
  query GetDepartments($region: String!) {
    departments(region: $region)
  }
`;

export const GET_COMMUNES = gql`
  query GetCommunes($department: String!) {
    communes(department: $department)
  }
`;

export const GET_TREE_SPECIES = gql`
  query GetTreeSpecies {
    treeSpecies
  }
`;

export const GET_LIEUX_DITS = gql`
  query GetLieuxDits {
    lieuxDits
  }
`;

// Requêtes pour les données forestières
export const GET_FORESTS = gql`
  query GetForests($filters: ForestFilterInput) {
    forests(filters: $filters) {
      id
      region
      department
      commune
      lieuxdit
      treeSpecies
      surfaceArea
      description
    }
  }
`;

export const GET_FOREST_STATISTICS = gql`
  query GetForestStatistics($filters: ForestFilterInput) {
    forestStatistics(filters: $filters) {
      totalArea
      averageArea
      count
    }
  }
`;

// Mutations d'authentification
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginUserInput!) {
    login(input: $input) {
      access_token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterUserInput!) {
    register(input: $input) {
      access_token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      firstName
      lastName
    }
  }
`;

// Ajout de gestion des erreurs pour les requêtes
export const handleGraphQLError = (error: any) => {
  console.error('GraphQL Error:', error);
  alert('Une erreur est survenue lors de la récupération des données.');
};