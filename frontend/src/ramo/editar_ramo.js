import React from "react";
import { LinkContainer } from "react-router-bootstrap";

export default class editar_ramo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          ramo: {
            codigo: "",
            nombre: "",
            semestre: 5
          }
        };
        // this.handleSubmit = this.handleSubmit.bind(this);
        // this.handleChange = this.handleChange.bind(this);
      }

      
    //   // Fetch ramo de api
    //   async componentDidMount() {
    //     const id  = this.props.match.params.id;
    //     const ramo = await fetch(
    //       process.env.REACT_APP_API_URL + "/ramos/" + id,  {
    //       headers: {
    //         "Authorization": "Token " + window.localStorage.getItem("jwt")
    //       }}
    //     ).then(res => res.json());
    //     this.setState({ ramo: ramo });
    //   }

    render() {
        const id= this.props.match.params.id
        return (
            <div>
                <h4 className="titulo">Editar ramo</h4>
                    <form className="" name="form">
                        <div class="generic-form">
                            <div class="row">
                                <div class="col-sm-1"></div>
                                <div class="col-sm-5" >
                                    <div class="row">
                                        <div class="col-sm-2" >
                                            <label >Ramo</label>
                                        </div>
                                        <div class="col-sm-10" >
                                            <input type="text" className="form-control" name="nombre_ramo" placeholder="Algoritmo y Estructura de Datos" style={{textAlignLast:'center'}} />
                                        </div>
                                    </div>
                                </div>  

                                <div class="col-md-4">
                                    <div class="row" style={{justifyContent: 'center'}} >
                                        <div class="col-md-2" >
                                            <label >Código</label>
                                        </div>
                                        <div class="col-sm-10" >
                                        <input type="text" className="form-control" name="codigo_ramo" placeholder="CC3001" style={{textAlignLast:'center'}}  />
                                        </div>
                                    
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-sm-1"></div>
                                <div class="col-sm-5" >
                                    <div class="row">
                                        <div class="col-sm-2" >
                                            <label >Semestre</label>
                                        </div>
                                        <div class="col-sm-10" >
                                        {/* No pude centrarlo, hay un problema con prioridades de css de react */}
                                            <select className="form-control center" name="semestre_malla" style={{textAlignLast:'center',textAlign:'center'}}  >
                                                <option value="5">Quinto</option>
                                                <option value="6">Sexto</option>
                                                <option value="7">Séptimo</option>
                                                <option value="8">Octavo</option>
                                                <option value="9">Noveno</option>
                                                <option value="10">Décimo</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>  
                                <div class="col-md-4">
                                    <div class="row" style={{justifyContent: 'center'}} >
                                        <div class="col-md-2" >
                                            <label >Código Antiguo</label>
                                        </div>
                                        <div class="col-sm-10" >
                                        <input type="text" className="form-control" name="codigo_ramo" placeholder="CC3001" style={{textAlignLast:'center'}}  />
                                        </div>
                                    
                                    </div>
                                </div>
                            </div>

                            
                    
                        </div>
                        <div class="form-group" style={{'marginTop':"4rem"}}>
                        <LinkContainer  activeClassName=""  to="/ramos" className="float-left " style={{width: '7%', 'marginLeft':"10vw",borderRadius: '8px'}}>
                            <button >Volver</button>
                        </LinkContainer>

                        <LinkContainer activeClassName=""  to="/ramos" style={{width: '7%','marginRight':"14vw",borderRadius: '8px'}}>
                            <button type="submit">Guardar</button>
                        </LinkContainer>
                        </div>
                    </form>
            </div>
        );
      } 
}