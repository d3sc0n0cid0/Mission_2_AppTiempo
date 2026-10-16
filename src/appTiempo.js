//Importamos de los otos js
import { fetchWeatherByMunicipio } from './api/Aemet.js';
import {renderDatosTiempo, renderHora,renderFecha, mostrarError, ocultarError} from './render/renderTiempo.js';
import {buscarCodigoMunicipio} from "./logic/tiempoUtils.js"

//Variables globales
  //(0 = Hoy, 1 = Mañana)
let elegirDia = 0;
let municipio = 28079;

//Carga el tiempo que hace del municipio que se pida, si no se mete ninguno se usa de default madrid
async function cargarTiempo(codigoMunicipio = '28079') {
  ocultarError();
  //Esperamos hasta recivir los datos json de la api de aemet
  const datos = await fetchWeatherByMunicipio(codigoMunicipio);
  if (!datos) {//Si datos no existe
    mostrarError("No se pudieron consultar los datos del tiempo.");
    return;
  }
  if (datos.error) {//Si falla la conexión y hay mensaje de error
    mostrarError(datos.mensaje);
    return;
  }
  //Si todo va bien, entonces actualizamos todos los datos, temperatura, umedad, viento etc.
  renderDatosTiempo(datos, elegirDia);//Los datos del municipio y de que día lo queremos (0 hoy, 1 mañana, hatsa los 7 días disponibles)
}
//Botones para hoy y mañana
  //Hoy
  const botonHoy = document.getElementById("hoy");
  botonHoy.addEventListener("click", async()=>{
    if(botonHoy){
      elegirDia=0;
      await cargarTiempo(municipio);
      renderFecha(elegirDia);
    }
  });
  //Mañana
  const botonMannana = document.getElementById("mannana");
  botonMannana.addEventListener("click", async()=>{
    if(botonMannana){
      elegirDia=1;
      await cargarTiempo(municipio);
      renderFecha(elegirDia);
    }
  });

function inicializarBuscador() {
  const inputBusqueda = document.querySelector(".inputBusqueda");
  const botonBuscar = document.getElementById("buscarMunicipio");

  if (inputBusqueda && botonBuscar) {//Si existe busqueda y boton
    /*Cuando se pulse el botón(Espera a que cargarTiempo termine de hacer la petición a AEMET,
    reciba los datos y termine de renderizar el DOM antes de continuar con la siguiente línea de código.)
    Al no usar await, la función de búsqueda no "espera" a que la operación asíncrona termine. 
    Si quisieras ejecutar algo después de que el municipio se haya buscado y cargado en pantalla 
    (por ejemplo, limpiar el campo de texto del input, deshabilitar el botón mientras carga, o encadenar otra acción), 
    el código continuaría antes de que la AEMET responda.*/
    botonBuscar.addEventListener("click", async () => {
      //Pasamos el texto a minúsculas y quitamos los espacios para que pueda coincidir con los datos de los municipios
      const texto = inputBusqueda.value.toLowerCase().trim();
      if (!texto) return;//Si no hay texto no hacemos nada
      //Comprobamos que exista lo que mos han pedidos
      municipio = buscarCodigoMunicipio(texto);
      if (municipio) {
        // AWAIT para resolver la petición y refrescar la pantalla
        await cargarTiempo(municipio);//Se lo pasamos para que actualice los datos
      } else {//Si no existe:
        mostrarError(`No se encontró el municipio "${texto}". Prueba con Madrid, Barcelona, Sevilla...`);
      }
    });
    inputBusqueda.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        botonBuscar.click();
      }
    });
  }
}

function inicializarPdf() {
  const botonInformacion = document.getElementById("botonInformacion");
  const contenedorPdf = document.querySelector(".pdf-container");

  if (botonInformacion && contenedorPdf) {//Si
    botonInformacion.addEventListener("click", () => {
      contenedorPdf.classList.toggle("mostrar");
    });
  }
}

function main() {
  cargarTiempo();
  renderHora();
  setInterval(renderHora, 1000);
  renderFecha(elegirDia);
  inicializarBuscador();
  inicializarPdf();
}

document.addEventListener("DOMContentLoaded", main);