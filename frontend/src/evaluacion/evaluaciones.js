import React from "react";
import {LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import OptionButton from "../common/OptionButton";
import {Pencil, Trashcan,ArrowLeft} from "@primer/octicons-react";
import DeleteModal from "../common/DeleteModal";
import { Table, Container, Alert} from "react-bootstrap";
import axios from "axios";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ViewTitle from "../common/ViewTitle";
import Alert_2 from '@material-ui/lab/Alert';

export class evaluaciones extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            evaluaciones: [],
            curso: {
                id: "",
                seccion: "",
                ramo: "",
                semestre: "",
                profesor: ""
            },
            showModal: false,
            evaluacionPorEliminar: {
                id: "",
                titulo: "",
                fecha: "",
                tipo: "",
                curso: ""
            },
            editar_index: -1,
            eliminar_index: -1,
            form_focus: false,

            form_errors: {},
            errors_checked: {},

            id: "",
            fecha: "",
            tipo: "Control",
            titulo: "",

            fecha_inicio_semestre:"",
            fecha_fin_semestre:"",
            
            evaluacion_modified: false,
            evaluacion_created: false,

            MostrarEvaluaciones: [],
            deleteModalMsg: "",
        //   search: ""
        };
        

        this.form = null

        this.divToFocus = React.createRef() //para focusear la caja de creacion de nueva evaluacion
    }

    onChange = e => {
        let errors_checked = this.state.errors_checked
        let form_errors = this.state.form_errors
        errors_checked[e.target.name] = false
        form_errors[e.target.name] = ""
        this.setState({
          [e.target.name]: e.target.value,
          errors_checked: errors_checked,
          form_errors: form_errors
        })
    };


    onClickCancel = e => {
        e.preventDefault();
        this.form.reset()
        this.setState({
            editar_index: -1,
            form_focus: true,
            id: "",
            fecha: "",
            tipo: "Control",
            titulo: "",
            form_errors: {},
            errors_checked: {},

        })
    }
    handleSubmit = e => {
        e.preventDefault();
        console.log("submit");
        if(this.state.editar_index >= 0){
            this.update_evaluacion();
        }
        else{
            this.create_evaluacion()
        }
    
    }

    //Scroll para nueva evaluacion
    handleClickNuevaEvaluacion = (e) => {
        e.preventDefault();
        this.form.reset()
        this.setState({
            editar_index: -1,
            form_focus: true,

            id: "",
            fecha: "",
            tipo: "Control",
            titulo: "",

            form_errors: {},
            errors_checked: {},
        })
        
    }
    handleClickEditarEvaluacion = (i) => {
        // e.preventDefault()
        this.setState({
            editar_index: i,
            form_focus: true,

            id: this.state.evaluaciones[i].id,
            fecha: this.state.evaluaciones[i].fecha,
            tipo: this.state.evaluaciones[i].tipo,
            titulo: this.state.evaluaciones[i].titulo,
            form_errors: {},
            errors_checked: {},
        })
        this.form.reset()
        // window.location.href = "evaluaciones?editar=" + id
    }
    async fetchEvaluaciones() {
        console.log("Fetching...")
        const params= this.props.match.params
        var curso = await fetch(process.env.REACT_APP_API_URL + `/cursos/?semestre=${params.ano}&periodo=${params.semestre}&ramo=${params.cod}&seccion=${params.seccion}`)
                            .then(response => response.json())
        this.state.curso = curso[0]
        await fetch(process.env.REACT_APP_API_URL + `/cursos/${this.state.curso.id}/evaluaciones/`)
        .then(response => response.json())
        .then(evaluaciones =>
            this.setState({
            evaluaciones: evaluaciones.sort((a, b) => {
                if (a.fecha < b.fecha)
                  return -1;
                if (a.fecha > b.fecha)
                  return 1;
                return 0;
              }),
            MostrarEvaluaciones: evaluaciones,
          })
        )
    }

    validateForm(){
        let errores = {}
        let isValid = true
        let titulo = this.state.titulo
        let fecha = this.state.fecha
        let tipo = this.state.tipo
        let errors_checked = {
            titulo: true,
            fecha: true,
            tipo: true,
        }

        if(titulo === ""){
            errores["titulo"] = "Debe ingresar un titulo para la evaluación"
            isValid = false
        }
        if(tipo != "Control" && tipo != "Tarea"){
            errores["tipo"] = "Debe elegir uno de los dos tipos"
            isValid = false
        }
        if(fecha === ""){
            errores["fecha"] = "Debe ingresar una fecha"
            isValid = false
        }

        let dateformat = (/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/)|(/^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/);
        if(!fecha.match(dateformat) && fecha !== ""){
            errores["fecha"] = "El formato de la fecha es incorrecto"
            isValid = false
        }
        else if(fecha !== ""){
            let inicio = new Date(this.state.fecha_inicio_semestre)
            let fin = new Date(this.state.fecha_fin_semestre)
            let fecha_evaluacion = new Date(fecha)
            if( fin - fecha_evaluacion < 0 || fecha_evaluacion - inicio < 0){
                errores["fecha"] = "Fecha de evaluacion debe estar en el rango de fechas del semestre"
                isValid = false
            }
        }
        this.setState({
            form_errors: errores,
            errors_checked: errors_checked
        })
        return isValid

    }
    update_evaluacion() {  
        console.log("post evaluacion ...")
        if(!this.validateForm()){
            return;
        }
        const url = process.env.REACT_APP_API_URL + `/evaluaciones/${this.state.id}/`
        let options = {
          method: 'PATCH',
          url: url,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${this.props.auth.token}`
          },
          data: {
            "fecha": this.state.fecha,
            "tipo": this.state.tipo,
            "titulo": this.state.titulo,
            "curso": this.state.curso.id
            }
        }
        console.log(options)
        axios(options)
        .then( (res) => {
            console.log("evaluacion updated");
            let evaluaciones = this.state.evaluaciones
            evaluaciones[this.state.editar_index] = res.data
            this.form.reset()
            this.setState({
                evaluacion_modified: true,
                evaluaciones: evaluaciones,
                eliminar_index: -1,
                editar_index: -1,
                id: "",
                fecha: "",
                tipo: "Control",
                titulo: "",
                form_errors: {},
                errors_checked: {}
            });
            // window.location.reload(false);
        })
        .catch( (err) => {
            if (err.response.status===401){// Fecha choca con fecha especial
                var errores=this.state.form_errors
                var errors_checked=this.state.errors_checked
                errores["fecha"]="Fecha ingresada no es válida, ya que choca con fecha especial"
                errors_checked["fecha"]=false
                this.setState({
                    form_errors: errores,
                    errors_checked: errors_checked
                })
                return false
            }
            else{
                console.log(err);
                console.log("cant update evaluacion");
                let errors = this.state.form_errors
                for (let [key, value] of Object.entries(err.response.data)){
                    if(err.response.status===400)
                        errors[key] = value
                    else
                        errors[key] = value[0]
                }
                this.setState({
                    form_errors:errors
                })
            }
        });
    }


    async handleDelete() {
        let evaluacion = this.state.evaluacionPorEliminar
        let e = evaluacion.id
        let evaluaciones = this.state.evaluaciones
        let i = this.state.eliminar_index
        console.log(i)
        const titulo = evaluacion.titulo;
        const tipo = evaluacion.tipo;
        console.log("Eliminar: ", evaluaciones[i]);
    
        const url = process.env.REACT_APP_API_URL + `/evaluaciones/${e}/`
        let options = {
          method: 'DELETE',
          url: url,
          headers: {
        
            'Content-Type': 'application/json',
            'Authorization': `Token ${this.props.auth.token}`
          }
      }
      axios(options)
      .then( (res) => {
        // alert(`Evaluacion Eliminada ${titulo} - ${tipo}`);
        evaluaciones.splice(i, 1);
        this.setState({
            evaluaciones :evaluaciones,
            eliminar_index: -1,
            editar_index: -1,
            showModal: false,

            id: "",
            fecha: "",
            tipo: "Control",
            titulo: "",

            
        });
      })
      .catch( (err) => {
        console.log(err);
        alert("[ERROR] No se puede eliminar la evaluación! ");
      });
    }

    create_evaluacion() {  
        console.log("post evaluaciones ...")
        if(!this.validateForm()){
            return;
        }
        var evaluaciones = this.state.evaluaciones
        const url = process.env.REACT_APP_API_URL + "/evaluaciones/"
        let options = {
          method: 'POST',
          url: url,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${this.props.auth.token}`
          },
          data: {
            "fecha": this.state.fecha,
            "tipo": this.state.tipo,
            "titulo": this.state.titulo,
            "curso": this.state.curso.id
        }
      }
      axios(options)
      .then( (res) => {
        console.log("create evaluacion");
        evaluaciones.push(res.data)
        this.form.reset()
        this.setState(
            {
                evaluacion_created: true,
                evaluaciones: evaluaciones,
                id: "",
                fecha: "",
                tipo: "Control",
                titulo: "",
                form_errors: {},
                errors_checked: {}
            });
      })
      .catch( (err) => {
        console.log("cant create evaluacion");
        console.log(err);
        if (err.response.status===401){// Fecha choca con fecha especial
            var errores=this.state.form_errors
            var errors_checked=this.state.errors_checked
            errores["fecha"]="Fecha ingresada no es válida, ya que choca con fecha especial"
            errors_checked["fecha"]=false
            this.setState({
                form_errors: errores,
                errors_checked: errors_checked
            })
            return false
        }
        else{
            console.log("cant create evaluacion");
            console.log(err);
            let errors = this.state.form_errors
            for (let [key, value] of Object.entries(err.response.data)){
                if(Array.isArray(err.response.data[key]))
                    errors[key] = value[0]
                else if(typeof(err.response.data[key] === "string"))
                    errors[key] = value
            }
            this.setState({
                form_errors:errors
            })
            }
      });
    }

    async componentDidMount() {
        this.fetchEvaluaciones();
        this.fetch_semestre();
        var id = this.state.id
        if (id !== ""){
            axios.get(process.env.REACT_APP_API_URL + `/evaluaciones/${id}/`)
            .then( (res) => { 
                this.setState({
                    id: res.data.id,
                    titulo: res.data.titulo,
                    fecha: res.data.fecha,
                    tipo: res.data.tipo,
                    eliminar_index: -1,
                })
            })
        }
        console.log(this.state)
    }
    async fetch_semestre(){
        const {ano,semestre}= this.props.match.params
        const periodo= semestre==="Otoño"? 1: 2;
        axios.get(process.env.REACT_APP_API_URL + `/semestres/?año=${ano}&periodo=${periodo}`)
        .then( (res) => { 
            this.setState({
                fecha_inicio_semestre:res.data[0].inicio,
                fecha_fin_semestre:res.data[0].fin
            })
        })      
    }
    async componentDidUpdate(){
        if(this.divToFocus.current && this.state.form_focus){
            this.divToFocus.current.scrollIntoView({
                behavior: "auto" ,
                // block: "nearest"
            })
        }
    }

    showModal(evaluacion, index) {
        this.setState({ 
            showModal: true, 
            evaluacionPorEliminar: evaluacion, 
            eliminar_index: index,
            deleteModalMsg: `¿Está seguro que desea eliminar ${evaluacion.tipo == "Tarea" ?  "la Tarea: " : "el Control: " } ${evaluacion.titulo}`
        });
    }
    
    handleCancel() {
        this.setState({ showModal: false, ramoPorEliminar: null });
    }
    
    createFormRender(){
        const campos = ["fecha", "titulo", "tipo"]
        return (
            <form className="" name="form" ref={(e) => this.form = e} onSubmit={this.handleSubmit}> 
                <div className="generic-form" ref={this.divToFocus}>  
                    <h4>Nueva Evaluación</h4>
                    { 
                    Object.keys(this.state.form_errors).map(k => {
                    if(!(campos.includes(k))){
                        return (
                        <Alert_2  severity="error">{this.state.form_errors[k]}</Alert_2>
                        )
                    }
                    })
                    }
                    <div className="row">
                    <div className="col-sm-1"></div>        
                        <div className="col-sm-5">
                            <div className="row" >
                                <div className="col-sm-2" >
                                    <label >Título<span style={{color:"red"}}>*</span></label>
                                </div>
                                <div className="col-sm-10" >
                                    <input type="text" className={this.state.form_errors["titulo"] ? "form-control is-invalid" : this.state.errors_checked["titulo"] ? "form-control is-valid" : "form-control"} name="titulo"  value={this.state.titulo} style={{textAlignLast:'center'}} onChange={this.onChange} />
                                    <span style={{color: "red", fontSize:"13px"}}>{this.state.form_errors["titulo"]}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-5">
                            <div className="row" >
                                <div className="col-sm-2" >
                                    <label >Fecha<span style={{color:"red"}}>*</span></label>
                                </div>
                                <div className="col-sm-10" >
                                    <input type="date" className={this.state.form_errors["fecha"] ? "form-control is-invalid" : this.state.errors_checked["fecha"] ? "form-control is-valid" : "form-control"} name="fecha"  value={this.state.fecha} style={{textAlignLast:'center'}} onChange={this.onChange} min={this.state.fecha_inicio_semestre} max={this.state.fecha_fin_semestre}/>
                                    <span style={{color: "red", fontSize:"13px"}}>{this.state.form_errors["fecha"]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1"></div>
                        <div className="col-sm-5" >
                            <div className="row" >
                                <div className="col-sm-2" >
                                    <label >Tipo<span style={{color:"red"}}>*</span></label>
                                </div>
    
                                <div className="custom-control custom-radio custom-control-inline"  >
                                    <input type="radio" id="control" name="tipo" value="Control"  className={this.state.form_errors["tipo"] ? "custom-control-input is-invalid" : this.state.errors_checked["tipo"] ? "custom-control-input is-valid" : "custom-control-input"} onChange={this.onChange} checked={this.state.tipo == "Control"}/>
                                    <label className="custom-control-label" htmlFor="control">Control</label>
                                </div>
                                <div style={{textAlign:'center'}} className="custom-control custom-radio custom-control-inline" >
                                    <input type="radio" id="tarea" name="tipo" value="Tarea"  className={this.state.form_errors["tipo"] ? "custom-control-input is-invalid" : this.state.errors_checked["tipo"] ? "custom-control-input is-valid" : "custom-control-input"} onChange={this.onChange} checked={this.state.tipo == "Tarea"}/>
                                    <label className="custom-control-label" htmlFor="tarea" >Tarea</label>
                                </div>
                                <span style={{color: "red", fontSize:"13px"}}>{this.state.form_errors["tipo"]}</span>
                            </div>
                        </div>  
                    </div>
                    <div className="row">
                        <div className="col-sm-2"></div> 
                        <button type="submit" className="float-right btn btn-success col-sm-2">Guardar</button>                 
                        <div className="col-sm-4"></div>
                        <button className="btn btn-secondary col-sm-2" onClick={this.onClickCancel}> Cancelar</button>
                    </div>
                </div>
            </form>
        )
    }
    updateFormRender(){
        var ev = this.state.evaluaciones[this.state.editar_index];
        const campos = ["fecha", "titulo", "tipo"]
        return (
            <form className="" name="form" ref={(e) => this.form = e} onSubmit={this.handleSubmit}> 
                <div className="generic-form" ref={this.divToFocus}>  
                    <h4>Editar {ev.tipo}: {ev.titulo}</h4>
                    { 
                    Object.keys(this.state.form_errors).map(k => {
                    if(!(campos.includes(k))){
                        return (
                        <Alert_2  severity="error">{this.state.form_errors[k]}</Alert_2>
                        )
                    }
                    })
                    }
                    <div className="row">
                    <div className="col-sm-1"></div>        
                        <div className="col-sm-5">
                            <div className="row" >
                                <div className="col-sm-2" >
                                    <label >Título<span style={{color:"red"}}>*</span></label>
                                </div>
                                <div className="col-sm-10" >
                                    <input type="text" className={this.state.form_errors["titulo"] ? "form-control is-invalid" : this.state.errors_checked["titulo"] ? "form-control is-valid" : "form-control"} name="titulo"  value={this.state.titulo} placeholder="Título" style={{textAlignLast:'center'}} onChange={this.onChange} />
                                    <span style={{color: "red", fontSize:"13px"}}>{this.state.form_errors["titulo"]}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-5">
                            <div className="row" >
                                <div className="col-sm-2" >
                                    <label >Fecha<span style={{color:"red"}}>*</span></label>
                                </div>
                                <div className="col-sm-10" >
                                    <input type="date" className={this.state.form_errors["fecha"] ? "form-control is-invalid" : this.state.errors_checked["fecha"] ? "form-control is-valid" : "form-control"} name="fecha" value={this.state.fecha} style={{textAlignLast:'center'}} onChange={this.onChange} min={this.state.fecha_inicio_semestre} max={this.state.fecha_fin_semestre}/>
                                    <span style={{color: "red", fontSize:"13px"}}>{this.state.form_errors["fecha"]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1"></div>
                        <div className="col-sm-5" >
                            <div className="row" >
                                <div className="col-sm-2" >
                                    <label >Tipo<span style={{color:"red"}}>*</span></label>
                                </div>
    
                                <div className="custom-control custom-radio custom-control-inline"  >
                                    <input type="radio" id="control" value="Control" name="tipo"  className={this.state.form_errors["tipo"] ? "custom-control-input is-invalid" : this.state.errors_checked["tipo"] ? "custom-control-input is-valid" : "custom-control-input"} onChange={this.onChange} checked={this.state.tipo == "Control"}/>
                                    <label className="custom-control-label" htmlFor="control">Control</label>
                                </div>
                                <div style={{textAlign:'center'}} className="custom-control custom-radio custom-control-inline" >
                                    <input type="radio" id="tarea" value="Tarea" name="tipo"  className={this.state.form_errors["tipo"] ? "custom-control-input is-invalid" : this.state.errors_checked["tipo"] ? "custom-control-input is-valid" : "custom-control-input"} onChange={this.onChange} checked={this.state.tipo == "Tarea"}/>
                                    <label className="custom-control-label" htmlFor="tarea" >Tarea</label>
                                </div>
                                <span style={{color: "red", fontSize:"13px"}}>{this.state.form_errors["tipo"]}</span>
                            </div>
                        </div>  
                    </div>
                    <div className="row">
                        <div className="col-sm-2"></div>
                            <button className="btn btn-primary col-sm-2" type="submit">Actualizar Evaluación</button>
                        <div className="col-sm-4"></div>
                        <button className="btn btn-secondary col-sm-2" onClick={this.onClickCancel}> Cancelar</button>

                    </div>
                </div>
            </form>
        )
    }
    
    
    render() {
        return (
            <Container>
            <DeleteModal
                msg={this.state.deleteModalMsg}
                show={this.state.showModal}
                handleCancel={() => this.handleCancel()}
                handleDelete={() => this.handleDelete()}
            />
            <div>
            <ViewTitle>
            <Link  to="../../../"><OptionButton   icon={ArrowLeft} description="Volver a cursos" /></Link>
           Evaluaciones</ViewTitle>
                {/* <h4 className="titulo">Evaluaciones</h4> */}
                    <div className="generic-form border-0">  
                        <div className="col-sm-7" >
                            <div className="row">
                                <div className="col-sm-2" >
                                    <label >Curso</label>
                                </div>
                                <div className="col-sm-5" >
                                    <input type="text" className="form-control" name="nombre_curso" placeholder={this.state.curso.ramo + "-" + this.state.curso.seccion}  style={{textAlignLast:'center'}} readOnly="readonly"/>
                                </div>
                                    <LinkContainer to="#"  activeClassName="" onClick={this.handleClickNuevaEvaluacion} style={{'marginLeft':"3vw"}}>
                                        <button  className="btn btn-primary" >Agregar Evaluación</button>
                                    </LinkContainer>
                            </div>
                        </div>
                    </div>
                    <div className="generic-form border-0">
                        <Table size="sm" responsive className="table table-condensed">
                        <thead>
                            <tr>
                            <th scope="col">Nombre</th>
                            <th scope="col">Fecha</th>
                            <th scope="col">Tipo</th>
                            <th scope="col"></th>
                            </tr>
                        </thead>
                            {this.state.MostrarEvaluaciones.map((evaluacion, _index) => (
                                <EvaluacionItem
                                key={evaluacion.id}
                                id={evaluacion.id}
                                index = {_index}
                                fecha={evaluacion.fecha}
                                id_curso={evaluacion.curso}
                                tipo={evaluacion.tipo}
                                titulo={evaluacion.titulo}
                                warning={evaluacion.warning}
                                handleUpdate={() => this.handleClickEditarEvaluacion(_index)}
                                showModal={() => this.showModal(evaluacion, _index)}
                                />
                            ))}

                        </Table>
                    </div>
                    
                    
                    {this.state.editar_index >= 0 ? this.updateFormRender() : this.createFormRender()}
                    
                    <Container style={{marginBottom:"8vw",marginTop:"2vw"}}>
                            <LinkContainer  activeClassName=""  to="../../../" className="float-left" >
                                <button className="btn btn-secondary">Volver a Cursos</button>
                            </LinkContainer>

                   </Container>
            </div>
            </Container>
        );
    }
}


class EvaluacionItem extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      const titulo =this.props.titulo;
      const fecha = this.props.fecha;
      const tipo= this.props.tipo;
      const warning= this.props.warning;
      const id = this.props.id;
      const id_curso = this.props.id_curso;
      const handleDelete = this.props.handleDelete;
      const handleUpdate = this.props.handleUpdate;
      const i = this.props.index;
      const fec=fecha.split("-")
      const fecha_formato_m_d_y= fec[2]+"-"+fec[1]+"-"+fec[0]

      return (
        <thead >
            <tr >
            <td scope="col">{titulo}</td>
            <td scope="col">{fecha_formato_m_d_y}{warning==null? "": <Alert_2 style={{size: "10"}} variant="outlined" severity="warning" >{warning}</Alert_2>}            </td>
            <td scope="col">{tipo}</td>
            <td scope="col">
                <Link to="#" onClick={e => handleUpdate(i)}>
                    <OptionButton icon={Pencil} description="Modificar evaluación" />
                </Link>
                <OptionButton   icon={Trashcan} description="Eliminar evaluación"  onClick={() => this.props.showModal()}    last={true}  />
            </td>
            </tr>
        </thead>
      );
    }
  }

  const mapStateToProps = (state) => ({
    auth: state.auth
  });

  export default connect(mapStateToProps)(evaluaciones);