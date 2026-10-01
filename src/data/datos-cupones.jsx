export const CUPONES = [
  {
    codigo: "GAMER10",
    descripcion: "10% de descuento en tu compra",
    porcentajeDescuento: 10,
    tope: 15000,
    fechaInicio: "2024-01-01",
    fechaFin: "2027-12-31"
  },
  {
    codigo: "BIENVENIDO15",
    descripcion: "15% de descuento para nuevos clientes",
    porcentajeDescuento: 15,
    tope: 20000,
    fechaInicio: "2024-06-01",
    fechaFin: "2027-12-31"
  },
  {
    codigo: "GAMEHUB5",
    descripcion: "5% de descuento sin tope",
    porcentajeDescuento: 5,
    tope: 999999,
    fechaInicio: "2024-01-01",
    fechaFin: "2028-12-31"
  }
];

// Función para buscar un cupón por su código
function buscarCupon(codigo) {
  if (!codigo) return null;
  const codigoNormalizado = codigo.trim().toUpperCase();
  return CUPONES.find((cupon) => cupon.codigo === codigoNormalizado) || null;
}