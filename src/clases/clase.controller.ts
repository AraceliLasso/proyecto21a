import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ClasesService } from "./clase.service";

@ApiTags("Clases")
@Controller("clases")
export class ClasesController {
    constructor(
        private readonly clasesService: ClasesService,
    ) { }

}



// GET
// POST
// PUT
// PATCH
// DELETE