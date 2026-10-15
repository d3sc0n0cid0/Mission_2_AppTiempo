// Aemet.js
const API_KEY = import.meta.env.VITE_AEMET_API_KEY;

export async function fetchWeatherByMunicipio(codigoMunicipio = '28079') {
  try {
    if (!API_KEY) {
      console.error('Falta la API Key en el archivo .env (VITE_AEMET_API_KEY)');
      return { error: 'FALTA_KEY', mensaje: 'Falta configurar la API Key.' };
    }

    const url = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${codigoMunicipio}/?api_key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    // Si el servidor responde con 429
    if (response.status === 429) {
      console.warn('Límite de peticiones alcanzado en la AEMET (Error 429).');
      return { 
        error: 'TOO_MANY_REQUESTS', 
        mensaje: 'Has realizado demasiadas peticiones. Espera un par de minutos.' 
      };
    }

    if (!response.ok) {
      throw new Error(`Error HTTP en petición inicial: ${response.status}`);
    }

    const data = await response.json();

    if (data.estado !== 200) {
      if (data.estado === 429) {
        return { 
          error: 'TOO_MANY_REQUESTS', 
          mensaje: 'Límite de la AEMET alcanzado.' 
        };
      }
      console.warn(`Aviso de AEMET (${data.estado}): ${data.descripcion}`);
      return null;
    }

    // Segunda petición para obtener la información meteorológica final
    const responseDatos = await fetch(data.datos);
    if (!responseDatos.ok) {
      throw new Error('Error al consultar el servidor de datos de AEMET.');
    }

    const datosTiempo = await responseDatos.json();
    return datosTiempo;

  } catch (error) {
    console.error('Fallo al obtener los datos de la AEMET:', error);
    return null;
  }
}