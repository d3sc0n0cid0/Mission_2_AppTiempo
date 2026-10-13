// Api de Aemet (obtenida desde .env)
const API_KEY = import.meta.env.VITE_AEMET_API_KEY;

export async function fetchWeatherByMunicipio(codigoMunicipio = '28079') { //Define y exporta la función, sin esperar a que las peticiones de red terminen sin congelar la pantalla.
  //Si no se le pasa nada entonces usa por defecto el de Madrid
  try {
    if (!API_KEY) { //Si exite la API
      console.error('Falta la API Key en el archivo .env (VITE_AEMET_API_KEY)');
      return null;
    }

    const url = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${codigoMunicipio}/?api_key=${API_KEY}`;
    //Monta el enlace pasando el código del municipio y la clave de API en los parámetros de la URL.


    const response = await fetch(url, {
      method: 'GET', //Especifica que el tipo de consulta es para solicitar/obtener datos.
      headers: {
        'Accept': 'application/json' //Le indica al servidor que la respuesta deseada debe ser en formato JSON.
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP en petición inicial: ${response.status}`);
    }

    const data = await response.json(); //Lee el cuerpo de la respuesta HTTP y lo convierte de formato texto JSON a un objeto JavaScript utilizable.

    if (data.estado !== 200) {
      console.warn(`Aviso de AEMET (${data.estado}): ${data.descripcion}`);
      return null;
    }

    // Petición a la URL que contiene los datos finales
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