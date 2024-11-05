import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Clases } from "./clase.entity";
import { Repository } from "typeorm";

@Injectable()
export class ClasesService{
    constructor (
        @InjectRepository(Clases)
        private readonly clasesRepository: Repository<Clases>
    ){}
    // GET
    // POST
    // PUT
    // PATCH
    // DELETE
}