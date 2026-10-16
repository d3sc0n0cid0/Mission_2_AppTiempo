/*La lógica */
//Imports
import municipios from '../assets/json/municipios_espana.json';

//USamos el json que tiene todos los municipios con su código
export function buscarCodigoMunicipio(nombreBuscado) {
  if (!nombreBuscado) return null;
  
  const municipioEncontrado = municipios.find(m => 
    m.nombre.toLowerCase().trim() === nombreBuscado.toLowerCase().trim()
  );

  return municipioEncontrado ? municipioEncontrado.codigo : null;
}

/*Busca en una lista el valor cuya hora es más cercana a la hora dada usando reduce
Esto es porque en muchos momentos en vez dedarme por ejemplo
Hora: 6, despejado, 7, despejado, 8, despejado, 9, nublado
Lo que hacen es:
6-9 despejado, 9 nublado
*/
export function obtenerEstadoHorario(lista, horaActual = new Date().getHours()) {
  if (!Array.isArray(lista) || lista.length === 0) return null;

  //Sacar el punto medio de cualquier periodo ("06-12" -> 9, "18" -> 18)
  const obtenerHoraCentro = (periodo) => {
    if (!periodo) return 0;
    if (periodo.includes('-')) {//Es un rango
      const [inicio, fin] = periodo.split('-').map(Number);
      return (inicio + fin) / 2; // Punto medio del rango
    }
    return Number(periodo);
  };

  //Busca si la hora actual cae EXACTAMENTE dentro de algún tramo
  const tramoCoincidente = lista.find(item => {
    if (!item.periodo) return false;
    if (item.periodo.includes('-')) {
      const [inicio, fin] = item.periodo.split('-').map(Number);
      return horaActual >= inicio && horaActual < fin;
    }
    return Number(item.periodo) === horaActual;
  });
  if (tramoCoincidente) return tramoCoincidente; //Si lo encuentra, lo devuelve directamente

  // Si ningún tramo coincide, busca el más cercano comparando centros
  return lista.reduce((masCercano, item) => {
    if (!item.periodo) return masCercano;

    const centroItem = obtenerHoraCentro(item.periodo);
    const centroMasCercano = obtenerHoraCentro(masCercano.periodo);

    const difActual = Math.abs(horaActual - centroItem);
    const difMasCercano = Math.abs(horaActual - centroMasCercano);

    return difActual < difMasCercano ? item : masCercano;
  });
}


//Feha y hora
  //Fecha
  export function obtenerFechaFormateada(diaDeMas=0) {
    const ahora = new Date();
    const dia = String(ahora.getDate()+diaDeMas).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();

    return {fecha: `${dia}/${mes}/${anio}`};
  }
  //Hora
  export function obtenerHoraFormateada() {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0'); //El padStat lo que hace es, comprueba que getHours sea un número y si tiene un solo caracter por ejemplo 4, pone un 0 delante ex: 04
    const minutos = String(ahora.getMinutes()).padStart(2, '0');

    return {hora: `${horas}:${minutos}`};
}

