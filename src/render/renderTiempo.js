//Importamos
import { obtenerEstadoHorario, obtenerHoraFormateada, obtenerFechaFormateada } from '../logic/tiempoUtils.js';

//MESANEJ DE ERROR
    //Mostrar el mensaje de error debajo de la barra de buscar por si algo pasa
export function mostrarError(mensaje) {
  const contenedorError = document.querySelector(".contenedorError");
  const textoError = document.querySelector(".codigoError");
  if (contenedorError && textoError) {
    textoError.textContent = mensaje;
    contenedorError.style.display = "block";
    textoError.style.color = "red";
  }
}
    //Ocultamos el error una vez se ha arreglado
export function ocultarError() {
  const contenedorError = document.querySelector(".contenedorError");
  if (contenedorError) contenedorError.style.display = "none";
}
//FECHA Y HORA
//Ponemos la hora y fecha en el html actualizado
export function renderHora() {
  const horaElem = document.querySelector(".hora");
  if (!horaElem) return;
  horaElem.textContent = `Hora: ${obtenerHoraFormateada()}`;
}
export function renderFecha(dia){
    const fechaElem = document.querySelector(".fecha");
    if (!fechaElem) return;
    fechaElem.textContent = `Día: ${obtenerFechaFormateada(dia)}`;
}

//DATOS TIEMPO

function renderTemperatura(prediccionDia){
  //Temperaturas Máxima y Mínima
  const tempMax = document.querySelector(".tempMax");
  const tempMin = document.querySelector(".tempMin");
  if (tempMax) tempMax.textContent = `${prediccionDia.temperatura?.maxima ?? '--'}°C`;//Si temperatura es null o undefined entonces muestra --
  if (tempMin) tempMin.textContent = `${prediccionDia.temperatura?.minima ?? '--'}°C`;

    //Temperatura Actual
  const tempActElem = document.querySelector(".temperaturaActual");
  const tempCercana = obtenerEstadoHorario(prediccionDia.temperatura?.dato);
  if (tempActElem) tempActElem.textContent = tempCercana ? `${tempCercana.value}°C` : '--°C';
}
function renderSensacionTermica(prediccionDia){
  //Sensación Térmica
  const sensActElem = document.querySelector(".sensacionTermica");
  const sensCercana = obtenerEstadoHorario(prediccionDia.sensTermica?.dato);
  if (sensActElem) sensActElem.textContent = sensCercana ? `Sensación térmica: ${sensCercana.value}°C` : 'Sensación térmica: --°C';
  
}
function renderHumedad(prediccionDia){
  //Humedad
  const elemHumedad = document.querySelector(".humedad");
  if (elemHumedad) {
    const maxH = prediccionDia.humedadRelativa?.maxima ?? '--';
    const minH = prediccionDia.humedadRelativa?.minima ?? '--';
    elemHumedad.textContent = `Humedad: ${minH}% - ${maxH}%`;
  }
}
function renderViento(prediccionDia){
  //Viento
  const elemViento = document.querySelector(".viento");
  if (elemViento) {
    const vientoTramo = obtenerEstadoHorario(prediccionDia.viento);
    const direccion = vientoTramo?.direccion || 'Calma';
    const velocidad = vientoTramo?.velocidad?.[0]?.value ?? vientoTramo?.velocidad ?? 0;
    elemViento.textContent = `${direccion} ${velocidad} km/h`;
  }
}
function renderPrecipitacion(prediccionDia){
  //Precipitación
  const elemPrecip = document.querySelector(".precipitacion");
  if (elemPrecip) {
    const precipTramo = obtenerEstadoHorario(prediccionDia.probPrecipitacion);
    const prob = precipTramo?.value ?? 0;
    elemPrecip.textContent = `Precipitación: ${prob}%`;
  }
}
function renderImagenDescripcion(prediccionDia){
    /*Cuando ejecutas npm run build (vite build), Vite procesa todos los archivos, 
  los cambia de nombre para optimizarlos y los mete dentro de la carpeta dist. 
  La carpeta /src desaparece por completo en la versión final de producción, por lo que las
   imágenes darían un error 404 (imagen rota). Por eso tengo que hacer lo siguiente*/
  
  const textDescElem = document.querySelector(".descripcionTiempo");
  const imgElem = document.querySelector(".imagenTiempo");
  
  //Buscamos el estado actual del cielo y si no lo encuentra usa la de respaldo
  const tramosValidos = (prediccionDia.estadoCielo || []) //quedarse solo con aquellos objetos que no sean nulos y que contengan una descripcion o un value válido:
    .filter(item => item && (item.descripcion || item.value));

  const tramoEstado = obtenerEstadoHorario(tramosValidos) || tramosValidos[0];
  
  const descripcion = tramoEstado?.descripcion
    ? tramoEstado.descripcion.charAt(0).toUpperCase() + tramoEstado.descripcion.slice(1)//Si son 2 palabaras aka poco nubloso
    : 'No disponible';

  if (textDescElem) textDescElem.textContent = descripcion;

  if (imgElem) {
    const nombreImagen = descripcion
      .toLowerCase() //Minuscula
      .trim()//Sin espacios al principio o final
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")//Quitamos las tildes
      .replace(/\s+/g, "_");//Los espacios intermedios los vuelve _

    // LO QUE DEBES PONER (Compatibilidad con Vite Build):
    const rutaImagen = new URL(`../assets/img/${nombreImagen}.png`, import.meta.url).href;
    const rutaFallback = new URL(`../assets/img/sun.png`, import.meta.url).href;

    imgElem.src = rutaImagen;
    imgElem.alt = descripcion;    
    // Si la imagen no existe en la carpeta, usamos sun.png como respaldo
    imgElem.onerror = () => { imgElem.src = rutaFallback; };  }
}

export function renderDatosTiempo(datos, indiceDia = 0) {
  const prediccionDia = datos?.[0]?.prediccion?.dia?.[indiceDia];//Tomamos los datos del día que queremos
  if (!prediccionDia) {
    mostrarError("No se encontraron datos meteorológicos para este día.");
    return;
  }
  ocultarError();
    //Temperatura max, min y actual
    renderTemperatura(prediccionDia);
    //Sensación Térmica
    renderSensacionTermica(prediccionDia)
    //Humedad
    renderHumedad(prediccionDia);
    //Viento
    renderViento(prediccionDia);
    //Precipitación
    renderPrecipitacion(prediccionDia);
    //Descripción del tiempo e imagen || Hay pocas imágenes porque en españa no suele variar y con las que hay me ha dado para probar si cambiaba la imagen así que no sonnnecesarias más
    renderImagenDescripcion(prediccionDia);
}

//COSAS APARTE QUE HA PEDIDO EL WEBIARENA PARA MEJORAR LA NOTA
// src/render/renderTiempo.js

// IMPORTANTE: Asegúrate de añadir los elementos correspondientes en el HTML
// o adaptar las funciones según las clases/IDs que tengas en tu plantilla.

export function mostrarCargando() {
  const contenedorError = document.querySelector(".contenedorError");
  const textoError = document.querySelector(".codigoError");
  if (contenedorError && textoError) {
    textoError.textContent = "Cargando datos del tiempo...";
    textoError.style.color = "#0056b3";
    contenedorError.style.display = "block";
  }
}
export function ocultarCargando() {
  ocultarError();
}

export function bloquearControles() {
  const inputBusqueda = document.querySelector(".inputBusqueda");
  const botonBuscar = document.getElementById("buscarMunicipio");
  const botonHoy = document.getElementById("hoy");
  const botonMannana = document.getElementById("mannana");

  if (inputBusqueda) inputBusqueda.disabled = true;
  if (botonBuscar) botonBuscar.disabled = true;
  if (botonHoy) botonHoy.disabled = true;
  if (botonMannana) botonMannana.disabled = true;
}

export function desbloquearControles() {
  const inputBusqueda = document.querySelector(".inputBusqueda");
  const botonBuscar = document.getElementById("buscarMunicipio");
  const botonHoy = document.getElementById("hoy");
  const botonMannana = document.getElementById("mannana");

  if (inputBusqueda) inputBusqueda.disabled = false;
  if (botonBuscar) botonBuscar.disabled = false;
  if (botonHoy) botonHoy.disabled = false;
  if (botonMannana) botonMannana.disabled = false;
}