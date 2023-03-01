import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from './../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class DescargasService {

  constructor(private http: HttpClient) { }

  consultarVotanteHabilitado(request){
    return this.http.post<any>(`${environment.apiBaseVotaciones}${environment.votantesHabilitadosApi}`,request)
    .pipe(
      map(respuesta => {
        //this.respuestaLogin = respuesta;
        //console.log("respuesta autenticacion", this.respuestaLogin);
        return respuesta;
      }));
  }

  consultarTokenApiVotantes(){
    let formData: any = new FormData();
    formData.append('username', environment.userTokenVotaciones);
    formData.append('password', environment.passTokenVotaciones);
    return this.http.post<any>(`${environment.apiBaseVotaciones}${environment.getTokenVotacionesApi}`,formData)
    .pipe(
      map(respuesta => {
        //this.respuestaLogin = respuesta;
        //console.log("respuesta autenticacion", this.respuestaLogin);
        return respuesta;
      }));
  }

  downloadPDF(data: any) {
    let headers = new HttpHeaders();
    headers = headers.set('X-Authorization', 'D1051bYTego:APA91bEvMz-bc0TroLp8W56q9uIJsuSvMzXlljBGLCqqr6em5q3Wk2eDdY6v79vR3D5rjHS8J-8fpGvUuDvjUss');
    return this.http.post(`${environment.url}ConsultaCertificado`, data, { headers });
  }

  validarEstudianteExiste(request){
    return this.http.post<any>(`${environment.ApiBaseGraduados}${environment.validaEstudiante}`,request)
    .pipe(
      map(respuesta => {
        //this.respuestaLogin = respuesta;
        //console.log("respuesta autenticacion", this.respuestaLogin);
        return respuesta;
      }));
  }



  consultarPosiblesCarrerasGraduado(datosEstudiante: { num_iden: any; tipo_iden: any; }) {
    return this.http.post<any>(`${environment.ApiBaseGraduados}${environment.posiblesCarreras}`,datosEstudiante)
    .pipe(
      map(respuesta => {
        //this.respuestaLogin = respuesta;
        //console.log("respuesta autenticacion", this.respuestaLogin);
        return respuesta;
      }));
  }
  consultarPosiblesAniosGraduado(datosEstudiante: { num_iden: any; tipo_iden: any; }) {
    return this.http.post<any>(`${environment.ApiBaseGraduados}${environment.posiblesAniosGrado}`,datosEstudiante)
    .pipe(
      map(respuesta => {
        //this.respuestaLogin = respuesta;
        //console.log("respuesta autenticacion", this.respuestaLogin);
        return respuesta;
      }));
  }

  validaPreguntasReto(request) {
    return this.http.post<any>(`${environment.ApiBaseGraduados}${environment.validaRespuestasRecuperaClave}`,request)
    .pipe(
      map(respuesta => {
        //this.respuestaLogin = respuesta;
        //console.log("respuesta autenticacion", this.respuestaLogin);
        return respuesta;
      }));
  }

  registrarNotificarRecuperacion(datosRegistraNotifica) {
    return this.http.post<any>(`${environment.ApiBaseGraduados}${environment.registraNotificaRecuperaClave}`,datosRegistraNotifica)
    .pipe(
      map(respuesta => {
        //this.respuestaLogin = respuesta;
        //console.log("respuesta autenticacion", this.respuestaLogin);
        return respuesta;
      }));
  }

}
