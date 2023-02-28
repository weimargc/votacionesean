
export class Constants {

  static RUTA_GRID_LISTA_ESTUDIANTES = '/dashboard/graduados/admin-graduados';

  static readonly PERFILES = {
    ADMINISTRADOR: 'ADMINISTRADOR',
    GRADUADO: 'GRADUADO',
  };

  static readonly ROLES = {
    ROLE_ADMIN: 'ROLE_ADMIN',
    ROLE_GRADUADOS: 'ROLE_GRADUADOS',
    MENU_ENCUESTA_SATISFACCION:'ROLE_MENU_ENCUESTA_EVALUACION',
    MENU_DATOS_BASICOS:'ROLE_MENU_ENCUESTA_BASICOS',
    MENU_ENCUESTA_FINANCIACION:'ROLE_MENU_ENCUESTA_FINANCIACION',
    MENU_ENCUESTA_LABORALES:'ROLE_MENU_ENCUESTA_LABORALES',
    MENU_INTERESES_EXPECTATIVAS:'ROLE_MENU_ENCUESTA_ESPECTATIVAS',
  };

  static readonly ENTIDADES = {
    RECURSOS_PROPIOS:1
  }

  public static readonly TIPOS_CONTROLES_FORM = {
    SELECT:'select',
    RADIO:'radio',
    TEXT:'text',
    CHECKBOX:'checkbox',
    TEXTAREA:'textarea',
  }

  static readonly ESTADOS_MOMENTO_CERO ={
    PENDIENTE_MOMENTO_CERO:'PE_MC',
    DATOS_BASICOS_COMPLETO:'DB_OK',
    DATOS_FINANCIACION_COMPLETO:'DF_OK',
    DATOS_INTERESES_COMPLETO:'DI_OK',
    DATOS_LABORALES_COMPLETO:'DL_OK',
    ENCUESTA_SATISFACCION_COMPLETA:'ES_OK',
    MOMENTO_CERO_COMPLETO:'MC_OK',
  }

  static readonly MENSAJES_ALERTS = {
    ERROR_API: 'Lo sentimos, estamos presentando problemas en este momento, contacte al administrador.',
    EXITO_GUARDADO: 'La información se guardó correctamente.',
    ERROR_GUARDADO: 'No se pudo guardar la información, revise e intente nuevamente',
    NO_EXISTEN_DATOS: 'No se encontraron resultados',
    COMPETENCIA_MATRIZ_OBLIGATORIO: 'Debe registrar un competencia',
    RESULTADO_MATRIZ_OBLIGATORIO: 'Debe registrar un resultado de aprendizaje',
    CONGRUENCIA_MATRIZ_OBLIGATORIO: 'Debe marcar por lo menos una casilla de congruencia',
    NO_AUTORIZADO: 'Lo sentimos, la sesión ha expirado, por favor inicie nuevamente',
    SIN_PERFILES:'No tiene perfiles asignados, contacte al administrador',
  };

}

