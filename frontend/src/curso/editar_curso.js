import React from "react";
import {LinkContainer } from "react-router-bootstrap";
import axios from "axios";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Redirect } from 'react-router-dom';

export class editar_curso extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            semestre_año:"",
            semestre_periodo:"",
            profesores: [],
            ramos:[],
            ramo:"",
            codigo:"",
            profesores_curso:[],
            seccion:"1",
            MostrarProfesores: [],
            MostrarRamos:[],
            semestre_id:"",
            id_curso:"",
            curso_update: false
          };
    
        const { ano, semestre } = this.props.match.params;
        this.paths = `/semestres/${ano}/${semestre}/`;
    }

    static propTypes={
        auth: PropTypes.object.isRequired,
    };

    async fetchProfesores() {
        console.log("Fetching Profesores...")
        await fetch(`http://127.0.0.1:8000/api/profesores/`)
        .then(response => response.json())
        .then(profesores =>
          this.setState({
            profesores: profesores,
            MostrarProfesores: profesores
          }))    
      }
      
    async fetchRamos() {
        console.log("Fetching Ramos...")
        await fetch(`http://127.0.0.1:8000/api/ramos/`)
        .then(response => response.json())
        .then(ramos =>
          this.setState({
            ramos: ramos,
            MostrarRamos:ramos
          }))    
      }
    
    async fetchCurso() {
        const { ano, semestre ,cod,seccion} = this.props.match.params;
        this.setState({ semestre_año: ano, semestre_periodo:semestre })
        await fetch(`http://127.0.0.1:8000/api/cursos/?ramo=${cod}&seccion=${seccion}&semestre=${ano}&periodo=${semestre}` )
        .then( res=> res.json())  
        .then( res => { 
                  this.setState({
                      ramo: res[0].ramo,
                      codigo:res[0].ramo,
                      seccion: res[0].seccion,
                      profesores_curso: res[0].profesor,
                      semestre_id:res[0].semestre,
                      id_curso:res[0].id
                  })
              })
    }

    async componentDidMount() {
        this.fetchProfesores();
        this.fetchRamos();
        this.fetchCurso();          
    }
    
    onChange = e => {
        if (e.target.name=="ramo"){
            this.setState({
                ["codigo"]: 
                e.target.value
            })
        }
        this.setState({
            [e.target.name]: 
            e.target.value
      })
    };

    onChangeSelected = e => {
        this.setState({profesores_curso: [...e.target.selectedOptions].map(o => o.value)}); 
    }
    handleSubmit = e => {
        e.preventDefault();
        console.log("submit");
        this.update_curso();
    }

    update_curso() {  
		console.log("post curso ...")
        console.log(this.state.ramo)
        // No pude encontrar otra forma de sacar el id, hay un problema con el formato del json
        console.log(this.state.seccion)
        console.log(this.state.profesores_curso)
        const url = `http://127.0.0.1:8000/api/cursos/${this.state.id_curso}/`
	    let options = {
			method: 'PATCH',
			url: url,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Token ${this.props.auth.token}`
			},
			data: {
				'ramo': this.state.ramo,
                'semestre': this.state.semestre_id,
                'seccion' : this.state.seccion,
                'profesor': this.state.profesores_curso
				}
		}
		
        axios(options)
			.then( (res) => {
				console.log(res);
				console.log("update curso");
				this.setState({"curso_update": true});
				window.location.href=this.paths;
			})
			.catch( (err) => {
                console.log(this.state)
				console.log(err);
				console.log("cant update curso");
				alert("No se pudo actualizar curso!");
			});
	}

    render() {
        return (
            <div>
                <h4 className="titulo">Editar curso</h4>
                    <form className="" name="form" onSubmit={this.handleSubmit}>
                        <div class="generic-form">
                            <div class="row">
                            <div class="col-sm-1"></div>
                                <div class="col-sm-6" >
                                    <div class="row">
                                        <div class="col-sm-2" >
                                            <label >Semestre</label>
                                        </div>
                                        <div class="col-sm-8" >
                                        <input className="form-control" style={{textAlignLast:'center'}}  placeholder={this.state.semestre_año+ "-"+ this.state.semestre_periodo} type="text" readOnly="readonly"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-sm-1"></div>
                                <div class="col-sm-6" >
                                    <div class="row">
                                        <div class="col-sm-2" >
                                            <label >Ramo</label>
                                        </div>
                                        <div class="col-sm-8" >
                                            <select className="form-control center" name="ramo" style={{textAlignLast:'center',textAlign:'center'}} onChange={this.onChange} >
                                                {this.state.MostrarRamos.map(ramos => (
                                                <option value={ramos.codigo}>{ramos.nombre}</option>
                                                ))}
                                            </select>
                                            
                                        </div>
                                    </div>
                                </div>  

                                <div class="col-md-4">
                                    <div class="row" style={{justifyContent: 'center'}} >
                                        <div class="col-md-3" >
                                            <label >Código</label>
                                        </div>
                                        <div class="col-sm-9" >
                                            <input type="text" className="form-control" name="codigo" value={this.state.codigo}  style={{textAlignLast:'center'}} readOnly="readonly"/>
                                        </div>
                                    
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-sm-1"></div>
                                <div class="col-md-6">
                                    <div class="row"  >
                                        <div class="col-md-2" >
                                            <label >Sección</label>
                                        </div>
                                        <div class="col-sm-8" >
                                        <input type="number" required className="form-control" name="seccion"  value={this.state.seccion} min="1" max="10" style={{textAlignLast:'center'}}  onChange={this.onChange} />
                                        </div>
                                    </div>
                                </div>

                                <div class="col-sm-4" >
                                    <div class="row">
                                        <div class="col-sm-3" >
                                            <label >Profesor</label>
                                        </div>
                                        <div class="col-sm-9" >
                                        {/* No pude centrarlo, hay un problema con prioridades de css de react */}
                                            <select required className="form-control center"  value={this.state.profesores_curso} name="profesores_curso" style={{textAlignLast:'center',textAlign:'center'}} onChange={this.onChangeSelected} size = "3" multiple={true}>
                                                {this.state.MostrarProfesores.map(profesor => (
                                                <option value={profesor.id}>{profesor.nombre}</option>
                                                ))}
                                                
                                                {/* <option value="5">Jeremy Barbay</option>
                                                <option value="6">Nelson Baloian</option> */}
                                            </select>
                                        </div>
                                    </div>
                                </div>  
                            </div>

                            {/* <div class="row">
                                <div class="col-sm-1"></div>
                                <div class="col-md-6">
                                    <div class="row" style={{justifyContent: 'center'}} >
                                        <div class="col-md-2" >
                                            <label >Descripción</label>
                                        </div>
                                        <div class="col-sm-9" >
                                        <textarea type="text"  rows="8" class="noresize form-control" name="descripcion_curso" placeholder="" style={{textAlignLast:'center'}}  />
                                        </div>
                                    
                                    </div>
                                </div>
                                </div> */}


                        </div>
                        <div class="form-group" style={{'marginTop':"4rem"}}>
                        <LinkContainer  activeClassName=""  to={this.paths} className="float-left " style={{'marginLeft':"10vw"}}>
                            <button className="btn btn-secondary" >Volver a Semestre</button>
                        </LinkContainer>

                        {/* <LinkContainer activeClassName=""  to={this.paths} style={{'marginRight':"14vw"}}> */}
                            <button className="btn btn-success" type="submit">Guardar Curso</button>
                        {/* </LinkContainer> */}
                        </div>
                    </form>
            </div>
        );
      } 
}
const mapStateToProps = (state) => ({
    auth: state.auth
});
   
export default connect(mapStateToProps)(editar_curso);