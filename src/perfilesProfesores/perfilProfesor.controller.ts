import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PerfilesProfesoresService } from "./perfilProfesor.service";


@ApiTags("PerfilProfesor")
@Controller("perfilProfesor")
export class PerfilesProfesoresController{
    constructor(
        private readonly PerfilesProfesoresService: PerfilesProfesoresService,
    ){}
    //GET
    
    //POST
    //PUT
    //DELETE
}

