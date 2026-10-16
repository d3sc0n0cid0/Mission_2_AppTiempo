/*Conexión de mi página web con la aemet para conseguir la
 información del tiempo en España y sus municipios */

/*Importamos la api que me ha dado la aemet para 3 meses*/
const API_KEY = import.meta.env.VITE_AEMET_API_KEY;
const TIEMPO_CACHE = 30 * 60 * 1000; // 30 minutos en milisegundos

/*espere hasta que se le mande algo, no para el código
y si no le pongo nada pone de default el municipio de madrid*/

// Guarda los datos en localStorage junto con la marca de tiempo actual
function guardarEnCache(codigoMunicipio, datos) {
  //Si el código de Madrid es '28079', la clave será "clima_28079".
  //Esto permite guardar el tiempo de varios municipios sin que se
  //sobrescriban unos a otros.
  const clave = `clima_${codigoMunicipio}`;
  const elementoGuardado = {
    timestamp: Date.now(), //Para luego ver si se ha caducado o no
    datos: datos
  };
  localStorage.setItem(clave, JSON.stringify(elementoGuardado));
}

// Lee los datos de localStorage si no han superado el tiempo de expiración
function obtenerDeCache(codigoMunicipio) {
  const clave = `clima_${codigoMunicipio}`;
  const elementoGuardado = localStorage.getItem(clave);
  if (!elementoGuardado) return null;//Si no estaba guardado de antes no se obtiene y se tendrá qeu cargar por primera vez
  try {
    const { timestamp, datos } = JSON.parse(elementoGuardado);
    const estaCaducado = Date.now() - timestamp > TIEMPO_CACHE;
    if (estaCaducado) {
      localStorage.removeItem(clave); // Borramos los datos antiguos
      return null;
    }
    return datos; // Devuelve los datos si siguen vigentes
  } catch (error) {
    localStorage.removeItem(clave);
    return null;
  }
}

export async function fetchWeatherByMunicipio(codigoMunicipio = '28079') {
  try { //Intenta usar la api, si falla algo dentro, ese fallo llama a error

    // Comprobamos si tenemos los datos guardados en la caché
    const datosGuardados = obtenerDeCache(codigoMunicipio);
    if (datosGuardados) {
      console.log(`[Caché] Recuperados datos del municipio ${codigoMunicipio} sin llamar a AEMET.`);
      return datosGuardados;
    }

    if (!API_KEY) { //Vemos si está bien la api
      console.error('Falta la API Key en el archivo .env (VITE_AEMET_API_KEY)');
       /*Esto es para que muestre en appTiempo el fallo en consola y saber que pasa exactamente*/
      return { error: 'FALTA_KEY', mensaje: 'Falta configurar la API Key.' };
    }

    //Si no hay datos guardado o hay que actualizar poruqe han caducado entonces: 
    /*Tomamos de la Aemet los datos de dicho municipio */
    const url = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${codigoMunicipio}/?api_key=${API_KEY}`;
    
    /*Estamos viendo a ver si la aemet nos da los datos*/
    const response = await fetch(url, {
      method: 'GET', /*Devuelve los datos en json*/
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.status === 429) { //Si sale esto es que hay muchas request por mi parte
      return { 
        error: 'TOO_MANY_REQUESTS', 
        mensaje: 'Has realizado demasiadas peticiones a AEMET. Espera un par de minutos.' 
      };
    }

    if (!response.ok) { //Si todo va bien entonces ya podemos acceder a los datos json
      throw new Error(`Error HTTP en petición inicial: ${response.status}`);
    }

    const data = await response.json(); //Pedimos los datos, nos pasan metadatos y una url temporal

    if (data.estado !== 200) {//Fallo con la petición json
      if (data.estado === 429) {//Muchas peticiones
        return { 
          error: 'TOO_MANY_REQUESTS', 
          mensaje: 'Límite de peticiones alcanzado.' 
        };
      }
      return { error: 'AEMET_ERROR', mensaje: data.descripcion || 'Error al obtener predicción.' };
    }

    // Segunda petición para obtener los datos definitivos
    const responseDatos = await fetch(data.datos);//Tomamos esos datos de la url que si nos dan la información
    if (!responseDatos.ok) {
      throw new Error('Error al consultar el servidor de datos de AEMET.');
    }

    const datosTiempo = await responseDatos.json();//Los transformamos al json

    // Guardamos la respuesta exitosa en localStorage antes de devolverla
    guardarEnCache(codigoMunicipio, datosTiempo);

    return datosTiempo;

  } catch (error) {
    console.error('Fallo al obtener los datos de la AEMET:', error);
    //Si algo falla entonces le damos esto al usuario a quien no le interesan las razones exactas de fallo de las api
    return { error: 'NETWORK_ERROR', mensaje: 'Error de conexión con AEMET.' };
  }
}