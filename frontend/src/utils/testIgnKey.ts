export async function testIgnApiKey() {
  const apiKey = process.env.NEXT_PUBLIC_IGN_API_KEY;
  try {
    const response = await fetch(
      `https://wxs.ign.fr/${apiKey}/geoportail/wmts?` +
      'SERVICE=WMTS&REQUEST=GetCapabilities'
    );
    
    if (!response.ok) {
      throw new Error('Clé API invalide');
    }
    
    console.log('Clé API IGN valide !');
    return true;
  } catch (error) {
    console.error('Erreur de validation de la clé API IGN:', error);
    return false;
  }
}
