export const environment = {
  production: false,
  apiBaseVotaciones:'http://127.0.0.1:8000/',
  ApiBaseGraduados:'https://graduados-dev.universidadean.edu.co/api',
  validaEstudiante:'/validacion/existe-estudiante/',
  posiblesCarreras:'/validacion/carreras-grado/',
  posiblesAniosGrado:'/validacion/anyos-grado/',
  validaRespuestasRecuperaClave:'/validacion/valida-respuestas/',
  registraNotificaRecuperaClave:'/validacion/actualiza-datos-contacto/',
  url: "https://consultacertificados-dev.universidadean.edu.co/api/Consulta/",
  votantesHabilitadosApi:'votaciones/api',
  getTokenVotacionesApi:'votaciones/api-token-auth/',
  userTokenVotaciones:'wgc',
  passTokenVotaciones:'123456',
  recaptcha: {
    siteKey: '6LcQjAEiAAAAAL9yBVeqzeLPOvuS_hKIz_WXeg0o',
  }
};
