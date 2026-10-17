/*TIEMPO_CACHE: 30 minutos en milisegundos*/
const TIEMPO_CACHE = 30 * 60 * 1000;

// Guarda los datos en localStorage junto con la marca de tiempo actual
export function guardarEnCache(codigoMunicipio, datos) {
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
export function obtenerDeCache(codigoMunicipio) {
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