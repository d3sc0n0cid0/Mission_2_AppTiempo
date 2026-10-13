//Importamos de Aemet 
import { fetchWeatherByMunicipio } from './api/Aemet.js';
/// Lista de municipios de prueba (puedes ampliarla o cargarla desde un archivo JSON externo)
const municipios = [
  { nombre: 'madrid', codigo: '28079' },
  { nombre: 'barcelona', codigo: '08019' },
  { nombre: 'sevilla', codigo: '41091' }
];

//Variables globales
let codigoMunicipio;
///////////////////////////////////////////////////////////
//De la API de Aemet

// Petición inicial
async function init(codigoMunicipio = '28079') {
  try {
    const datos = await fetchWeatherByMunicipio(codigoMunicipio);//Intentamos obtener los datos del municipio al que llamamos
    if (datos) {
      console.log('Datos de la AEMET recibidos correctamente:', datos);
    }
  } catch (error) {
    mostrarError(`Error al iniciar la consulta: ${error}`);
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

//Mostrar error
const contenedorError = document.querySelector(".contenedorError");
const textoError = document.querySelector(".codigoError");
function mostrarError(mensaje){
  textoError.textContent(`${mensaje}`);
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