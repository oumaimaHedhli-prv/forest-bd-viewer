export const IGN_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_IGN_API_KEY,
  wmsUrl: 'https://wxs.ign.fr/forestiere/geoportail/r/wms',
  wfsUrl: 'https://wxs.ign.fr/forestiere/geoportail/wfs',
  cadastreUrl: 'https://wxs.ign.fr/cadastralparcels/geoportail/wfs',
  layers: {
    bdForet: 'BDFORET.V2',
    cadastre: 'CADASTRALPARCELS.PARCELLES',
    lieuDit: 'ADMINISTRATIVEUNITS.TOPONYMES'
  }
};
