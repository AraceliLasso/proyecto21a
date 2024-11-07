import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PerfilesProfesoresService } from "./perfilProfesor.service";


@ApiTags("PerfilProfesor")
@Controller("perfilProfesor")
export class PerfilesProfesoresController{
    constructor(
        private readonly perfilesProfesoresService: PerfilesProfesoresService,
    ){}
    //GET
    
    //POST
    //PUT
    //DELETE
}

