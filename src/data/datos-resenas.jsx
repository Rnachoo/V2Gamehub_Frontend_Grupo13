export const RESENAS = [
  {
    id: 1,
    idProducto: 1,
    autor: "Camila Rojas",
    calificacion: 5,
    comentario: "Excelente sensor, muy preciso para juegos competitivos. La rueda del scroll se siente firme.",
    fecha: "2024-11-03"
  },
  {
    id: 2,
    idProducto: 1,
    autor: "Matías Fuentes",
    calificacion: 4,
    comentario: "Buen mouse por el precio, aunque el cable podría ser más flexible.",
    fecha: "2024-10-22"
  },
  {
    id: 3,
    idProducto: 1,
    autor: "Valentina Soto",
    calificacion: 5,
    comentario: "Llegó rápido y funciona perfecto. La iluminación RGB se ve genial.",
    fecha: "2024-09-15"
  },
  {
    id: 4,
    idProducto: 2,
    autor: "Diego Herrera",
    calificacion: 3,
    comentario: "Cumple, pero esperaba mejor calidad de construcción para el precio.",
    fecha: "2024-11-10"
  },
  {
    id: 5,
    idProducto: 2,
    autor: "Javiera Muñoz",
    calificacion: 5,
    comentario: "El mejor teclado mecánico que he probado, switches muy suaves.",
    fecha: "2024-08-30"
  },
  {
    id: 6,
    idProducto: 3,
    autor: "Sebastián Vidal",
    calificacion: 4,
    comentario: "Buena resolución y colores, algo de retraso en modo competitivo.",
    fecha: "2024-10-05"
  }
];

//Retorna solo las reseñas de un producto específico
function obtenerResenasPorProducto(idProducto) {
  return RESENAS.filter((resena) => resena.idProducto === idProducto);
}


//Mas claro el agua
function ordenarResenasPorFecha(listaResenas) {
  return [...listaResenas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}


//Retorna la ponderación de las reseñas de un producto específico
function calcularPromedioResenas(listaResenas) {
  if (!listaResenas || listaResenas.length === 0) return 0;
  const suma = listaResenas.reduce((acumulado, resena) => acumulado + resena.calificacion, 0);
  return suma / listaResenas.length;
}