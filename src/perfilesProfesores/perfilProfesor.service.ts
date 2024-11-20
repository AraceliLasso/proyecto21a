import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PerfilProfesor } from "./perfilProfesor.entity";

@Injectable()
export class PerfilesProfesoresService{
    constructor (
        @InjectRepository(PerfilProfesor)
        private readonly perfilesProfesoresRepository: Repository<PerfilProfesor>,
    ){}
    //*(cuando inscripciones este listo)
    //GET alumnos inscriptos a la clase del profesor
    

    async crearPerfilProfesor(){

    }
    //POST clases
    //PUT clases
    //DELETE clases
//*YA ESTAN en el modulo de clases
   
}