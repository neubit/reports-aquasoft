export const REQUIRED_FIELDS: { [key: string]: string[] } = {
  duplicadoFija: ['periodo', 'gerencia', 'sistema', 'sector'],
  duplicadoServ: ['periodo', 'numserv'],
  duplicadoLectura: ['periodo', 'gerencia', 'sistema', 'sector'],
  anexo13Convenios: ['gerencia', 'startDate', 'endDate'],
  cortesReconexion: ['gerencia', 'startDate', 'endDate'],
  noServicios: ['gerencia', 'startDate', 'endDate'],
  noAdeudo: ['gerencia', 'startDate', 'endDate'],
  instalaciones: ['gerencia', 'startDate', 'endDate'],
  facturacion: [
    'periodo',
    'gerencia',
    'sistema',
    'sector'
  ],
  contratosNuevos: [],
  resumenFacturacion: ['periodo', 'localidades', 'sectores'],
};
