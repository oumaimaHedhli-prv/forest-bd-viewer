import { IGN_CONFIG } from '../config/ignConfig';

interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export async function fetchBDForetData(bounds: BoundingBox) {
  const bbox = [bounds.west, bounds.south, bounds.east, bounds.north].join(',');
  const url = `${IGN_CONFIG.wfsUrl}?` +
    `SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&` +
    `TYPENAME=${IGN_CONFIG.layers.bdForet}&` +
    `BBOX=${bbox}&` +
    `outputFormat=application/json`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${IGN_CONFIG.apiKey}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch BD Forêt data');
  }

  return response.json();
}

export async function fetchCadastralData(bounds: BoundingBox) {
  const bbox = [bounds.west, bounds.south, bounds.east, bounds.north].join(',');
  const url = `${IGN_CONFIG.cadastreUrl}?` +
    `SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&` +
    `TYPENAME=${IGN_CONFIG.layers.cadastre}&` +
    `BBOX=${bbox}&` +
    `outputFormat=application/json`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${IGN_CONFIG.apiKey}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cadastral data');
  }

  return response.json();
}
