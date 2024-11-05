import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Clase } from "./clase.entity";
import { Repository } from "typeorm";

@Injectable()
export class ClasesService{
    constructor (
        @InjectRepository(Clase)
        private readonly clasesRepository: Repository<Clase>
    ){}
    // GET
    // POST
    // PUT
    // PATCH
    // DELETE
}