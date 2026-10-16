//Importamos de Aemet 
import { fetchWeatherByMunicipio } from './api/Aemet.js';
/// Lista de municipios de prueba (puedes ampliarla o cargarla desde un archivo JSON externo)
const municipios = [
  { nombre: 'madrid', codigo: '28079' },
  { nombre: 'barcelona', codigo: '08019' },
  { nombre: 'sevilla', codigo: '41091' }
];

//////////////////////////////////////////////////////////
//De la API de Aemet
  // Petición inicial
async function init(codigoMunicipio = '28079') {
  try {
    const datos = await fetchWeatherByMunicipio(codigoMunicipio);

    // Comprobamos si la API nos devolvió el aviso de Too Many Requests
    if (datos && datos.error === 'TOO_MANY_REQUESTS') {
      const tempAct = document.querySelector(".TemperaturaActua");
      if (tempAct) {
        tempAct.textContent = "Límite superado (Error 429). Reintenta en 5 min.";
      }
      return;
    }

    if (datos) {
      datosApi(datos);
    }
  } catch (error) {
    console.error(`Error al iniciar la consulta: ${error}`);
  }
}
  // Búsqueda de municipio
const inputBusqueda = document.querySelector(".inputBusqueda");
const botonBuscarMunicipio = document.getElementById("buscarMunicipio");
if (inputBusqueda && botonBuscarMunicipio) {//Si ambos existen
  botonBuscarMunicipio.addEventListener("click", () => {
    // Corregido: Leer directamente inputBusqueda.value en lugar de e.target.value
    const texto = inputBusqueda.value.toLowerCase().trim();
    if (texto === "") return;

    const municipioEncontrado = municipios.find(m => 
      m.nombre.toLowerCase() === texto
    );

    if (municipioEncontrado) {
      console.log(`Municipio encontrado: ${municipioEncontrado.nombre} (${municipioEncontrado.codigo})`);
      fetchWeatherByMunicipio(municipioEncontrado.codigo);
    } else {
      console.warn("No se encontró ningún municipio con ese nombre.");
    }
  });
}
//Están juntos todos los datos que quiero sacar a la api
function datosApi(datos){
  if (!datos || datos.length === 0) return;
  const prediccionHoy = datos[0].prediccion.dia[0];
  tempearturaActual(prediccionHoy);
  temperaturaMaxMin(prediccionHoy);
  sensacionTermicaActual(prediccionHoy);
  descripcionTiempo(prediccionHoy);
  humedad(prediccionHoy);
  viento(prediccionHoy);
  precipitacion(prediccionHoy);
}

function temperaturaMaxMin(prediccionHoy){
  const tempMaxima = prediccionHoy.temperatura.maxima;
  const tempMinima = prediccionHoy.temperatura.minima;

  const tempMax = document.querySelector(".tempMax");
  if (tempMax) {
    tempMax.textContent=`${tempMaxima}°C`;
  }
  const tempMin = document.querySelector(".tempMin");
  if(tempMin){
    tempMin.textContent=`${tempMinima}°C`;
  }
}
  //temperaura actual
function tempearturaActual(prediccionHoy){
  const horaActual = new Date().getHours();
  const listaTemperaturas = prediccionHoy.temperatura.dato; // Array con la lista de hora y temperatura[{ hora: 6, value: 15 }, { hora: 12, value: 20 }, ...]

  if (!listaTemperaturas || listaTemperaturas.length === 0) {return null;}

  let tempMasCercana = listaTemperaturas[0];
  let menorDiferencia = Math.abs(horaActual - listaTemperaturas[0].hora);

  listaTemperaturas.forEach((item) => {
    const diferencia = Math.abs(horaActual - item.hora);
    if (diferencia < menorDiferencia) {
      menorDiferencia = diferencia;
      tempMasCercana = item;
    }
  });
    const tempAct = document.querySelector(".temperaturaActual");
    if (tempAct) {
      tempAct.textContent = `${tempMasCercana.value}°C`;
    }

}
function sensacionTermicaActual(prediccionHoy){
  const horaActual = new Date().getHours();
  const listaSensacionTermica = prediccionHoy.sensTermica.dato; // Array con la lista de hora y sensaciontermica[{ hora: 6, value: 15 }, { hora: 12, value: 20 }, ...]

  if (!listaSensacionTermica || listaSensacionTermica.length === 0) {return null;}

  let sensMasCercana = listaSensacionTermica[0];
  let menorDiferencia = Math.abs(horaActual - listaSensacionTermica[0].hora);

  listaSensacionTermica.forEach((item) => {
    const diferencia = Math.abs(horaActual - item.hora);
    if (diferencia < menorDiferencia) {
      menorDiferencia = diferencia;
      sensMasCercana = item;
    }
  });
    const sensAct = document.querySelector(".sensacionTermica");
    if (sensAct) {
      sensAct.textContent = `Sensacion termica: ${sensMasCercana.value}°C`;
    }

}
function descripcionTiempo(prediccionHoy) {
  const textDescription = document.querySelector(".descripcionTiempo");
  if (!textDescription) return;

  const horaActual = new Date().getHours();
  const listaEstado = prediccionHoy.estadoCielo;

  if (!listaEstado || listaEstado.length === 0) {textDescription.textContent = 'No disponible';return;}

  //Buscamos el elemento que coincida con el rango de la hora actual
  let estadoEncontrado = listaEstado.find(item => {
    if (!item.periodo) return false;

    //El periodo pued evenir en rangos y no solo en números así que hay que probar con que tenga 6-12 y no solo 6
    if (item.periodo.includes('-')) {
      //Hacemos que se vuelva un array con 06 y 12
      const [inicio, fin] = item.periodo.split('-').map(Number);//Quitamos el - y convertimos a números cada uno de los textos que resultaron de dividir el periodo.
      return horaActual >= inicio && horaActual < fin;
    }
    // Si el periodo es una hora exacta "18"
    return Number(item.periodo) === horaActual;
  });

  //Si no encontró el tramo exacto, buscamos el primer elemento del array que tenga texto de descripción
  //Es para los casos dond ehago el split porque como hará el mismo tiempo pues se pasa el primer texto
  if (!estadoEncontrado || !estadoEncontrado.descripcion) {
    estadoEncontrado = listaEstado.find(item => item.descripcion && item.descripcion.trim() !== "");
  }

  if (estadoEncontrado && estadoEncontrado.descripcion) {
    // Ponemos la primera letra en mayúscula
    const desc = estadoEncontrado.descripcion;
    textDescription.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
  } else {
    textDescription.textContent = 'No disponible';
  }
  imagenTiempo(textDescription.textContent);
}
function imagenTiempo(texto) {
  const imagen = document.querySelector(".imagenTiempo");
  if (!imagen || !texto) return;

  //Convertimos el texto a minúsculas, quitamos tildes y reemplazamos espacios por guiones bajos
  const nombreImagen = texto   // Ejemplo: "Poco nuboso" -> "poco_nuboso"
    .toLowerCase()
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quita tildes (ej: "Lluvia" -> "lluvia")
    .replace(/\s+/g, "_");                             // Cambia espacios por "_"

    imagen.src = `/src/assets/img/${nombreImagen}.png`;
    imagen.alt = texto;
}
function humedad(prediccionHoy) {
  const elemHumedad = document.querySelector(".humedad");
  if (!elemHumedad) return;

  const datosHumedad = prediccionHoy.humedadRelativa;
  
  if (!datosHumedad) {
    elemHumedad.textContent = 'Humedad: No disponible';
    return;
  }

  // Si AEMET devuelve maxima/minima directa
  const max = datosHumedad.maxima ?? datosHumedad[0]?.maxima ?? '--';
  const min = datosHumedad.minima ?? datosHumedad[0]?.minima ?? '--';

  elemHumedad.textContent = `${min}% - ${max}%`;
}

function viento(prediccionHoy) {
  const elemViento = document.querySelector(".viento");
  if (!elemViento) return;

  const horaActual = new Date().getHours();
  const listaViento = prediccionHoy.viento;

  if (!listaViento || listaViento.length === 0) {
    elemViento.textContent = 'Calma 0 km/h';
    return;
  }

  // Buscamos el tramo horario coincidente o el primer elemento con dirección
  const vientoActual = listaViento.find(item => {
    if (!item.periodo) return false;
    if (item.periodo.includes('-')) {
      const [inicio, fin] = item.periodo.split('-').map(Number);
      return horaActual >= inicio && horaActual < fin;
    }
    return Number(item.periodo) === horaActual;
  }) || listaViento.find(item => item.direccion) || listaViento[0];

  // AEMET a veces envía velocidad como número o dentro de un array de velocidad
  const direccion = vientoActual.direccion || 'Calma';
  const velocidad = vientoActual.velocidad?.[0]?.value ?? vientoActual.velocidad ?? 0;

  elemViento.textContent = `${direccion} ${velocidad} km/h`;
}

function precipitacion(prediccionHoy) {
  const elemPrecipitacion = document.querySelector(".precipitacion");
  if (!elemPrecipitacion) return;

  const listaPrecipitacion = prediccionHoy.probPrecipitacion;

  if (!listaPrecipitacion || listaPrecipitacion.length === 0) {
    elemPrecipitacion.textContent = '0%';
    return;
  }

  const horaActual = new Date().getHours();

  // Buscamos el tramo coincidente
  const tramoActual = listaPrecipitacion.find(item => {
    if (!item.periodo) return false;
    if (item.periodo.includes('-')) {
      const [inicio, fin] = item.periodo.split('-').map(Number);
      return horaActual >= inicio && horaActual < fin;
    }
    return Number(item.periodo) === horaActual;
  });

  // Si no coincide tramo horario exacto, busca la probabilidad general (periodo "") o la máxima del día
  const probabilidad = tramoActual?.value 
    ?? listaPrecipitacion.find(item => item.periodo === "" || !item.periodo)?.value 
    ?? listaPrecipitacion[0]?.value 
    ?? 0;

  elemPrecipitacion.textContent = `${probabilidad}%`;
}
///////////////////////////////////////////////////////////
//Fuera de las API
  //Muestra y cambia la otra para mostrar la actual
function fechaHoraActual() { 
  const horaActual = document.querySelector(".hora");
  const fechaActual = document.querySelector(".fecha");

  // Si no existen en el HTML, detiene la ejecución para no lanzar excepción
  if (!horaActual || !fechaActual) return;

  const now = new Date();

  const horas = String(now.getHours()).padStart(2, '0');
  const minutos = String(now.getMinutes()).padStart(2, '0');
  const hora = `${horas}:${minutos}`;

  const dia = String(now.getDate()).padStart(2, '0');
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const anio = now.getFullYear();
  const fecha = `${dia}/${mes}/${anio}`;

  horaActual.textContent = `Hora: ${hora}`;
  fechaActual.textContent = `Día: ${fecha}`;
}

//Botones
  //Mostrar el mapa con la información numérica de cada municipio/ciudad de España
const botonInformacion = document.getElementById("botonInformacion");
const contededorpdf = document.querySelector(".pdf-container");
  botonInformacion.addEventListener("click", () => {
    contededorpdf.classList.toggle("mostrar"); //Si tiene la clase se la quita, si no la tiene se la pone
  });

//Mostrar Error
  //Mostrar error
const contenedorError = document.querySelector(".contenedorError");
const textoError = document.querySelector(".codigoError");
function mostrarError(mensaje){
 textoError.textContent=mensaje;
 contenedorError.classList.toggle("mostrar"); //Si tiene la clase se la quita, si no la tiene se la pone
}

///////////////////////////////////////////////////////////
//Llamada al main
function main() {
  init();
  fechaHoraActual();
  setInterval(fechaHoraActual, 1000); //Para que actualice cada segundo
}
// Llamar a main cuando la página cargue y lea primero las etiquetas HTML
document.addEventListener("DOMContentLoaded", () => {
  main();
});