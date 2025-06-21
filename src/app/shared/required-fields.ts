export const REQUIRED_FIELDS: { [key: string]: string[] } = {
  duplicadoFija: ['periodo', 'localidad', 'sistema', 'sector'],
  duplicadoServ: ['periodo', 'numserv'],
  duplicadoLectura: ['periodo', 'localidad', 'sistema', 'sector'],
  anexo13Convenios: ['localidad', 'startDate', 'endDate'],
  cortesReconexion: ['localidad', 'startDate', 'endDate'],
  noServicios: ['localidad', 'startDate', 'endDate'],
  noAdeudo: ['localidad', 'startDate', 'endDate'],
  instalaciones: ['localidad', 'startDate', 'endDate'],
  facturacion: [
    'periodo',
    'localidad',
    'sistema',
    'sector'
  ],
  contratosNuevos: [],
  recaudacionPorCaja: ['localidad', 'caja', 'fechaPago'],
  recaudacionCajaConceptos: ['localidad', 'caja', ''],
  reporteCartera: ['periodo', 'localidades'],
  resumenFacturacion: ['periodo', 'localidades',],
  verLectura: ['periodo', 'localidad', 'sector', 'rutas'],
};
