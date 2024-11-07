import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PerfilProfesor } from "./perfilProfesor.entity";

@Injectable()
export class PerfilesProfesoresService{
    constructor (
        @InjectRepository(PerfilProfesor)
        private readonly perfilesProfesoresRepository: Repository<PerfilProfesor>,
    ){}}