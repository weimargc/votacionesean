import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { Constants } from './common/constants.class';
import { ConfirmPasswordValidator } from './confirm-password.validator';
import { DescargasService } from './descargas.service';
import { EncryptService } from './encrypt.service';
import { SpinnerService } from './interceptors/interceptor.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('contentModalInfodescargaExito', { static: false }) childModalInfoDescargaExito: ElementRef;
  @ViewChild('contentModalConsultaExitosa', { static: false }) childModalConsultaExitosa: ElementRef;

  title = 'pdf';

  form: FormGroup | any;
  msgError: boolean = false;
  submitted: boolean = false;
  loader: boolean = false;
  data: string = "";
  messageError: string = "";
  base64data = "";
  codeEncryp = "";
  continuarPreguntasReto: boolean = false;
  formularioRecuperaCredenciales: any;
  formularioPreguntasReto: any;
  formularioCorreoNumero: any;
  // resolve: (value: any) => void;
  // reject: (reason?: any) => void;
  modal: any;
  mensajeErrorModalCredenciales: any;
  listaPosiblesAnios = [];
  listaPosiblesCarreras = [];
  intentoPreguntasReto: number =1;
  esPreguntaRetoValido: boolean;
  esNotificaado: boolean | undefined;
  tiposDocumento = [];
  tokenRecaptchaV2: string|undefined;
  recaptchaTemp: NgForm;
  correctaSolicitudHttp = false;
  date: Date = new Date();
  listaEstamentos: any[];
  initSpinner() {
    this._spinnerService.getSpinnerObserver().subscribe((status) => {
      this.correctaSolicitudHttp = (status === 'start');
      this.cdRef.detectChanges();
    });
  }

  constructor(private cdRef: ChangeDetectorRef, //para detectar cambios de estado de spinner
              private fb: FormBuilder, private serviceDescarga: DescargasService,
              private modalService: NgbModal,
              public _spinnerService: SpinnerService,
              private toastrService: ToastrService) {

               }

  ngOnInit(): void {
    let url = window.location;
    this.codeEncryp = url.hash.slice(2);
    this.crearrForm()
    this.initSpinner();
  }

  crearrForm() {
    this.form = this.fb.group({
      user: ['', [Validators.required]],
      pass: ['', Validators.required]
    })
  }

  validarUsuarioVotacion(formRecaptcha:NgForm){
    this.mensajeErrorModalCredenciales=null;
    this.recaptchaTemp = formRecaptcha;
    if (this.form.invalid) {
      return Object.values(this.form.controls).forEach((control:any) => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(c => c.markAsTouched());
        }
        else {
          control.markAsTouched();
        }
      });
    }

    if (this.form.invalid) {
      this.submitted = true
      return;
    }

    // 1. Obtener token para consumir API
       this.serviceDescarga.consultarTokenApiVotantes().subscribe(respToken=>{
        //console.log('respToken',respToken);
        sessionStorage.setItem('tokenv',respToken.token)
        let nombreUsuario:string = this.form.value.user.split('@')[0]
        const datosValidaEstudiante = {
          user: nombreUsuario.trim().toLowerCase(),
          pass: this.form.value.pass
         };
         this.consutarApiHabilitados(datosValidaEstudiante);

      },error=>{
        this.toastrService.error('No se pudo obtener el token.', 'No autorizado!');
        sessionStorage.removeItem('tokenv');
        return;
      });

  }

  validarUsuarioVotacionConCaptcha(formRecaptcha:NgForm){
    this.mensajeErrorModalCredenciales=null;
    this.recaptchaTemp = formRecaptcha;
    if (formRecaptcha.invalid) {
      for (const control of Object.keys(formRecaptcha.controls)) {
        formRecaptcha.controls[control].markAsTouched();
      }
      return Object.values(this.form.controls).forEach((control:any) => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(c => c.markAsTouched());
        }
        else {
          control.markAsTouched();
        }
      });
    }

    if (this.form.invalid) {
      this.submitted = true
      return;
    }
    const datosValidaEstudiante = {
      user: this.form.value.user,
      pass: this.form.value.pass
     };
     //console.log('datos usuario : >>', datosAutenticacion);
     this.serviceDescarga.validarEstudianteExiste(datosValidaEstudiante).subscribe(respValida=>{

      // 1. Obtener token para consumir API
      this.serviceDescarga.validarEstudianteExiste

      if(respValida.respuesta==='true'){
        //Lanzar modal
        this.abrirModalConsultaExitosa();
        // formRecaptcha.controls['recaptcha'].setValue(null);
      }else{
        this.mensajeErrorModalCredenciales = 'No se encontró el usuario en la base de datos. Intenta nuevamente.';
        this.toastrService.warning(this.mensajeErrorModalCredenciales, 'Ningún registro!');

        //Consultar Api habilitados
        this.consutarApiHabilitados(this.form.controls['user'].value);

      }
     },(error:any)=>{
      this.mensajeErrorModalCredenciales = Constants.MENSAJES_ALERTS.ERROR_API;
      this.toastrService.error(this.mensajeErrorModalCredenciales, 'Error!');
     });
  }

  consutarApiHabilitados(datosValidaEstudiante) {
    this.listaEstamentos=[];
    this.serviceDescarga.consultarVotanteHabilitado(datosValidaEstudiante).pipe().subscribe({
      next: (res: any) => {
        //console.log('resp: ',res);

        if (res.length>0) {
          res.forEach(element => {
            if(element.codigo_estamento && element.codigo_estamento !==''){
              this.listaEstamentos.push(element);
            }
          });
          //Validando que la lista por lo menos teng un elemento para mostrar
          if(this.listaEstamentos.length>0){
            this.abrirModalConsultaExitosa();
          }else{
            this.toastrService.warning('Usuario no habilitado para votar', 'No habiltado!');
          }
          sessionStorage.removeItem('tokenv');
        }else{
          this.toastrService.warning('Usuario no habilitado para votar', 'No habiltado!');
          sessionStorage.removeItem('tokenv');
        }
      },
      error: (error) => {
        if(error.status === 403){
          this.toastrService.warning('Usuario o contraseña incorrectos. Intenta nuevamente.', 'No autorizado!');
        }else{
          //console.log(error);
          this.listaEstamentos=[];
          this.toastrService.error(Constants.MENSAJES_ALERTS.ERROR_API, 'Error!');
        }
        sessionStorage.removeItem('tokenv');
      }
    })
  }

  abrirModalConsultaExitosa() {
    this.modalService.open(this.childModalConsultaExitosa, {backdrop:'static'});
  }

  sendData() {
    this.loader = true;
    this.msgError = false;
    let data = {
      usuario: this.form.controls['user'].value,
      contrasena: this.form.controls['pass'].value,
      hash: this.codeEncryp,
    };

    if (this.form.invalid) {
      this.submitted = true
      this.loader = false;
      return;
    }
    this.serviceDescarga.downloadPDF(data).pipe().subscribe({
      next: (res: any) => {
        if (res.code === "0") {
          this.messageError = res.description
          this.msgError = true;
          this.loader = false;
          return;
        }
        this.crearrForm();
        this.loader = false;
        this.getImage(res.byteArray)
      },
      error: () => {
        this.loader = false;
        this.msgError = true
      }
    })
  }

  public b64toBlob(b64Data = "", contentType = "") {
    contentType = contentType || '';
    let sliceSize = 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  getImage(base64: any) {
    var blob = this.b64toBlob(base64, "application/pdf");
    let a = document.createElement("a");
    document.body.appendChild(a);
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = String("Certificado académico Universidad Ean.pdf");
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    this.abrirModalInfoDescargaExitosa();
  }

  abrirModalInfoDescargaExitosa() {
    this.modalService.open(this.childModalInfoDescargaExito, {backdrop:'static'});
  }


  // SECCIÓN RECUPERAR CONTRASEÑA
  abrirModalrecuperarCredenciales(modalRecuperaCredenciales:any){
    this.continuarPreguntasReto=false;
    this.crearFormularioRecuperaCredenciales();
    this.crearFormularioPreguntasReto();
    this.crearFormularioCorreoNumero();
    this.modalService.open(modalRecuperaCredenciales, { centered: true, backdrop:'static', size:'md' });
  }
   /********MÉTODOS RECUPERAR CONTRASEÑA */

  //GETTERS
  get tipo_documentoNoValido(): boolean {
    return this.formularioRecuperaCredenciales.get('tipo_documento').invalid && this.formularioRecuperaCredenciales.get('tipo_documento').touched;
  }
  get documentoNoValido(): boolean {
    return this.formularioRecuperaCredenciales.get('documento').invalid && this.formularioRecuperaCredenciales.get('documento').touched;
  }

  get programaoNoValido(): boolean {
    return this.formularioPreguntasReto.get('programa').invalid && this.formularioPreguntasReto.get('programa').touched;
  }
  get anioNoValido(): boolean {
    return this.formularioPreguntasReto.get('anio').invalid && this.formularioPreguntasReto.get('anio').touched;
  }


  get correoNoValido(): boolean {
    return this.formularioCorreoNumero.get('correo').invalid && this.formularioCorreoNumero.get('correo').touched;
  }
  get telefonoNoValido(): boolean {
    return this.formularioCorreoNumero.get('telefono').invalid && this.formularioCorreoNumero.get('telefono').touched;
  }
  get claveNoValido(): boolean {
    return this.formularioCorreoNumero.get('clave').invalid && this.formularioCorreoNumero.get('clave').touched;
  }
  get claveConfirmNoValido(): boolean {
    return this.formularioCorreoNumero.get('claveConfirm').touched;
  }
  get autorizaDatosNoValido(): boolean {
    return this.formularioCorreoNumero.get('autorizaDatos').invalid && this.formularioCorreoNumero.get('autorizaDatos').touched;
  }

  crearFormularioRecuperaCredenciales(): void {

    this.formularioRecuperaCredenciales = this.fb.group(
      {
        documento: ['',[
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern('^[A-Za-z0-9]+$')
      ]],
        tipo_documento: ['', [Validators.required]],
      });
  }

  crearFormularioPreguntasReto(): void {

    this.formularioPreguntasReto = this.fb.group(
      {
        programa: ['', [Validators.required]],
        anio: ['', [Validators.required]],
      });
  }

  crearFormularioCorreoNumero(): void {

    this.formularioCorreoNumero = this.fb.group(
      {
        correo: ['', [Validators.required,  Validators.maxLength(100),
           Validators.pattern('^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$')]
          ],
        telefono:['', [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(10),
          Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$')
        ]],
        clave: ['', [Validators.required,Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%#*?&\\/(")+¡-])([A-Za-z\d$@$!%*?&\\/(")+¡-]|[^ ]){12,127}')]],
        claveConfirm: ['', [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%#*?&\\/(")+¡-])([A-Za-z\d$@$!%*?&\\/(")+¡-]|[^ ]){12,127}')]],
        autorizaDatos:['',Validators.required],
      },
      {
        validator: ConfirmPasswordValidator("clave", "claveConfirm")
      });
  }


  // openModalRecuperaCredencialesExterno(): Promise<any> {
  //   this.continuarPreguntasReto=false;
  //   this.crearFormularioRecuperaCredenciales();
  //   this.crearFormularioPreguntasReto();
  //   this.crearFormularioCorreoNumero();
  //   return new Promise((resolve, reject) => {
  //     this.resolve = resolve;
  //     this.reject = reject;
  //     this.modal = this.modalService.open(this.childModalRecuperaCredencialesExterna, { centered: true, backdrop:'static', size:'md' });
  //     // this.modalBienvenidaGraduado = this.modalService.open(this.childModalBienvenidaGraduado, { centered: true });
  //   });
  // }

  validarEstudianteExiste(formRecaptcha:NgForm){
    this.mensajeErrorModalCredenciales=null;
    this.recaptchaTemp = formRecaptcha;
    if (formRecaptcha.invalid) {
      for (const control of Object.keys(formRecaptcha.controls)) {
        formRecaptcha.controls[control].markAsTouched();
      }
      return Object.values(this.formularioRecuperaCredenciales.controls).forEach((control:any) => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(c => c.markAsTouched());
        }
        else {
          control.markAsTouched();
        }
      });
    }


       if (this.formularioRecuperaCredenciales.invalid) //validacion en rojo las casillas que no se han tocado
       {
         return Object.values(this.formularioRecuperaCredenciales.controls).forEach((control:any) => {
           if (control instanceof FormGroup) {
             Object.values(control.controls).forEach(c => c.markAsTouched());
           }
           else {
             control.markAsTouched();
           }
         });
       }
       else {


        // this.recaptchaV3Service.execute('importantAction')
        // .subscribe((token: string) => {
        //   console.log(`Token Captcha [${token}] generated`);
        // },error=>{
        //   console.log(`Error Captcha`);
        //   return;
        // });

         const datosValidaEstudiante = {
          num_iden: this.formularioRecuperaCredenciales.value.documento,
          tipo_iden: this.formularioRecuperaCredenciales.value.tipo_documento
         };
         //console.log('datos usuario : >>', datosAutenticacion);
         this.serviceDescarga.validarEstudianteExiste(datosValidaEstudiante).subscribe(respValida=>{
          if(respValida.respuesta==='true'){
            this.continuarPreguntasReto=true;
            this.mensajeErrorModalCredenciales=null;
            //RECUPERANDO ANIOS Y CARRERAS
            this.consultarAnisoCarrerasGraduado(datosValidaEstudiante);
            formRecaptcha.controls['recaptcha'].setValue(null);
          }else{
            this.continuarPreguntasReto=false;
            this.mensajeErrorModalCredenciales = 'No se encontró el tipo y número de documento en la base de datos. Intenta nuevamente.';
          }
         },(error:any)=>{
          this.continuarPreguntasReto=false;
          this.mensajeErrorModalCredenciales = Constants.MENSAJES_ALERTS.ERROR_API;
         });



       }
  }
  consultarAnisoCarrerasGraduado(datosEstudiante: { num_iden: any; tipo_iden: any; }) {
   forkJoin(
     this.serviceDescarga.consultarPosiblesAniosGraduado(datosEstudiante),
     this.serviceDescarga.consultarPosiblesCarrerasGraduado(datosEstudiante),
   ).subscribe(resp=>{
    this.listaPosiblesAnios = resp[0].anyos;
    this.listaPosiblesCarreras = resp[1].programas;

    //Quitar id duplicados
    this.listaPosiblesAnios = this.listaPosiblesAnios.filter((FinanUno: any, index: any, FinanDos: any[]) => index === FinanDos.findIndex((FinanDos: any) =>
          ((FinanDos === FinanUno))));
    //console.log(' this.listaPosiblesAnios', this.listaPosiblesAnios);
    //console.log(' this.listaPosiblesCarreras', this.listaPosiblesCarreras);
   },error=>{
    this.listaPosiblesAnios = [];
    this.listaPosiblesCarreras = [];
   });
  }


  validaPreguntasReto(){
    this.mensajeErrorModalCredenciales=null;
    if (this.formularioPreguntasReto.invalid) //validacion en rojo las casillas que no se han tocado
    {
      return Object.values(this.formularioPreguntasReto.controls).forEach((control:any) => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(c => c.markAsTouched());
        }
        else {
          control.markAsTouched();
        }
      });
    }

    else {
      const datosPreguntasReto = {
        carrera: this.formularioPreguntasReto.value.programa,
        anyo: this.formularioPreguntasReto.value.anio,
        num_iden: this.formularioRecuperaCredenciales.value.documento,
        tipo_iden: this.formularioRecuperaCredenciales.value.tipo_documento
      };
      //console.log('datos usuario : >>', datosAutenticacion);

      if(this.intentoPreguntasReto<=2){
        this.intentoPreguntasReto++;
        this.serviceDescarga.validaPreguntasReto(datosPreguntasReto).subscribe((resp: { respuesta: any; })=>{
          // console.log('resp valida preguntas',resp);
          if(resp.respuesta){
            this.continuarPreguntasReto=false;
            this.esPreguntaRetoValido=true;
            this.mensajeErrorModalCredenciales=null;
          }else{
            this.continuarPreguntasReto=true;
            this.esPreguntaRetoValido=false;
            if(this.intentoPreguntasReto<=2){
              this.mensajeErrorModalCredenciales='Tus respuestas no son correctas, tienes un reintento para contestar.';
            }else{
              this.mensajeErrorModalCredenciales='Tus respuestas no son correctas por favor ingresa a la dirección ';
            }
          }
        },(error: any)=>{
          //console.log('err resp valida preguntas',error);
          this.continuarPreguntasReto=true;
          this.esPreguntaRetoValido=false;
          this.mensajeErrorModalCredenciales = Constants.MENSAJES_ALERTS.ERROR_API;
        });

    }else{
      this.mensajeErrorModalCredenciales='Tus respuestas no son correctas por favor ingresa a la dirección ';
    }

    }
  }

  registrarNotificarRecuperacion(){
    // Se reincia a 1 el contador de reintento para validar que se muestre el mensje de emsa de ayuda
    this.intentoPreguntasReto==1;

    if (this.formularioCorreoNumero.invalid) //validacion en rojo las casillas que no se han tocado
    {
      return Object.values(this.formularioCorreoNumero.controls).forEach((control:any) => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(c => c.markAsTouched());
        }
        else {
          control.markAsTouched();
        }
      });
    }

    else {

      const datosRegistraNotifica = {
        num_iden: this.formularioRecuperaCredenciales.value.documento,
        tipo_iden: this.formularioRecuperaCredenciales.value.tipo_documento,
        email: this.formularioCorreoNumero.value.correo,
        celular: this.formularioCorreoNumero.value.telefono,
        password:this.formularioCorreoNumero.value.clave,
      };
      //console.log('datos usuario : >>', datosAutenticacion);
      this.serviceDescarga.registrarNotificarRecuperacion(datosRegistraNotifica).subscribe((resp: { respuesta: any; })=>{
        if(resp.respuesta){
          this.continuarPreguntasReto=true;
          this.esPreguntaRetoValido=false;
          this.esNotificaado = true;
        }else{
         this.noEsNotificado();
        }
      },(error: any)=>{

        this.noEsNotificado();
      })
    }
  }
  noEsNotificado() {
    this.esNotificaado = false;
          this.continuarPreguntasReto=false;
          this.esPreguntaRetoValido=true;
          this.intentoPreguntasReto=3;
          this.mensajeErrorModalCredenciales='No fue posible asignar la contraseña, intenta nuevamente o por favor ingresa a la dirección ';
  }

  cerrarAlert(){
    this.mensajeErrorModalCredenciales=null;
  }

  openModalAutorizaDatos(modalTratamientoDatos){
    this.modalService.open(modalTratamientoDatos, { centered: true, backdrop: 'static' });
  }

  /****************FIN SECCIÓN RECUPERAR CONTRASEÑA */
  cerrarModal(){
    this.continuarPreguntasReto= false;
    this.esPreguntaRetoValido=false;
    this.continuarPreguntasReto=false;
    this.mensajeErrorModalCredenciales = null;
    this.esNotificaado = false;
    this.intentoPreguntasReto=1;
    this.modalService.dismissAll();
    if(this.recaptchaTemp){
      let recaptTempoData =  this.recaptchaTemp.controls['recaptcha'];
      if(recaptTempoData){
        this.recaptchaTemp.controls['recaptcha'].setValue(null);
      }
    }
  }

  // FIN RECUPERAR CONTRASEÑA

}
