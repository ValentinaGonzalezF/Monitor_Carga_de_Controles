import React from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button, Modal } from "react-bootstrap";
import { Row} from "react-bootstrap";
import Alert_2 from '@material-ui/lab/Alert';

export class NuevaEvaluacion extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
				titulo: "",
                fecha: "",
                tipo:"Control",
                curso:null,
                evaluacion_created: false,
                nombre_curso:"",
                form_errors: {},
                errors_checked: {},
                fecha_inicio_semestre:"",
                fecha_fin_semestre:"",
                semestre_id:this.props.semestre
		}
	};
	static propTypes = {
			auth: PropTypes.object.isRequired,
    };

    componentDidMount(){
        axios.get(process.env.REACT_APP_API_URL + `/semestres/${this.state.semestre_id}/`)
        .then( (res) => { 
            this.setState({
                curso: this.props.curso_seleccionado.split("-")[0],
                fecha_inicio_semestre:res.data.inicio,
                fecha_fin_semestre:res.data.fin
            })
        })      
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

	handleSubmit = e => {
			e.preventDefault();
			console.log("submit");
			this.create_evaluacion();
	}
    validateForm(){
        let errores = {}
        let isValid = true
        let titulo = this.state.titulo
        let fecha = this.state.fecha
        let tipo = this.state.tipo
        let curso = this.state.curso
        let errors_checked = {
            titulo: true,
            fecha: true,
            tipo: true,
            curso: true
        }
        if(curso === "" || curso=== null || curso=== '0'){
            errores["curso"] = "Debe seleccionar un curso"
            isValid = false
        }
        else if (!this.props.cursos.some(c => c.id === parseInt(curso))){
            errores["curso"] = "Debe seleccionar un curso válido"
            isValid = false
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
        this.setState({
            form_errors: errores,
            errors_checked: errors_checked
        })
        return isValid

    }
    create_evaluacion() {  
        console.log("post evaluacion ...")
        let curso=this.state.curso
        if(!this.validateForm()){
            return;
        }
        if(curso==null){
            curso=this.props.curso_seleccionado.split("-")[0]
        }
        
        
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
                "curso": curso
				}
		}
		
		axios(options)
			.then( (res) => {
				console.log(res);
				console.log("create evauacion");
				this.setState({"evaluacion_created": true});
                this.state.sacar_pop_up()
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
                    console.log("cant create evaluacion");
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

	render() {
        const { show_form, handleCancel, handleAdd} = this.props;
        const curso_info=this.props.curso_seleccionado.split("-") //se recibe id- codigo-seccion y nombre de curso
        this.state.sacar_pop_up=handleAdd;
        let resetState = () => {
			this.setState({
				titulo: "",
                fecha: "",
                tipo:"Control",
                curso:null,
                evaluacion_created: false,
                nombre_curso:"",
                form_errors: {},
                errors_checked: {}
			  })
        }
        const campos = ["fecha", "titulo", "tipo", "curso"]
		return (
			<Modal size="xl" centered show={show_form} onHide={() => {handleCancel(); resetState()}}>
        <Modal.Header className="header-add" closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Agregar nueva evaluación 
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
					<div>
                    { 
                    Object.keys(this.state.form_errors).map(k => {
                    if(!(campos.includes(k))){
                        return (
                        <Alert_2  severity="error">{this.state.form_errors[k]}</Alert_2>
                        )
                    }
                    })
                    }
                    <form className="" name="form" ref={(e) => this.form = e} onSubmit={this.handleSubmit}> 
                    <div className="row">
                        <div className="col-sm-1"></div>        
                            <div className="col-sm-5">
                                <div className="row" >
                                    <div className="col-sm-2" >
                                    <label >Curso<span style={{color:"red"}}>*</span></label>
                                    </div>
                                    <div className="col-sm-10" >{
                                        
                                        (curso_info[0]!=0) ?                                              
                                            <select className='form-control' name='curso' value={curso_info[0]} readOnly='readonly' placeholder={curso_info[1]}>
                                                <option > {curso_info[1]}-{curso_info[2]}</option>
                                            </select>
                                            :
                                            <select className={this.state.form_errors["curso"] ? "form-control is-invalid" : this.state.errors_checked["curso"] ? "form-control is-valid" : "form-control"}  name="curso" style={{textAlignLast:'center',textAlign:'center'}} onChange={this.onChange} >
                                                <option value="" hidden >Seleccione curso</option>
                                                    {this.props.cursos.slice(1,this.props.cursos.length).map(curso=>
                                                        <option value={curso.id} >{curso.ramo}-{curso.seccion} {curso.nombre}</option>         
                                                        )}
                                            </select>
                                    
                                    }
                                    <span style={{color: "red", fontSize:"13px"}}>{this.state.form_errors["curso"]}</span>
                                    </div>
                                    </div>
                
                            </div>
                    </div>
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
                                    <input type="date" className={this.state.form_errors["fecha"] ? "form-control is-invalid" : this.state.errors_checked["fecha"] ? "form-control is-valid" : "form-control"} name="fecha"  value={this.state.fecha} style={{textAlignLast:'center'}} onChange={this.onChange}  min={this.state.fecha_inicio_semestre} max={this.state.fecha_fin_semestre}/>
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
                    <Row></Row>
                    <div style={{textAlign: 'center'}}>
                        <Button variant="success" type="submit">  Agregar </Button> 
                    </div>
            </form>			
					</div>
		</Modal.Body>
        {/* <Modal.Footer>
          <Button variant="secondary" onClick={() => handleCancel()}>
            Cancelar
          </Button>

        </Modal.Footer> */}
      </Modal>
			);
		} 
}

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(NuevaEvaluacion);