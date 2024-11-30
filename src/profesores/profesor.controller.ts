import { 
    Controller, 
    Post, 
    Body, 
    NotFoundException, 
    InternalServerErrorException 
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProfesorService } from './profesor.service';
import { SearchDtoo } from 'src/shared/dto/search.dto';
import { Profesores } from './profesor.entity'; // Ajusta según la ubicación de tu entidad

@ApiTags('Profesores') // Categoría para Swagger
@Controller('profesores')
export class ProfesoresController {
    constructor(private readonly profesoresService: ProfesorService) {}

    @Post('search')
    @ApiOperation({ summary: 'Buscar profesores por nombre, categoría, perfil o descripción' })
    @ApiResponse({ status: 200, description: 'Profesores encontrados', type: [Profesores] })
    @ApiResponse({ status: 404, description: 'No se encontraron profesores' })
    async searchProfesores(@Body() searchDtoo: SearchDtoo): Promise<Profesores[]> {
        try {
            const profesores = await this.profesoresService.searchProfesores(searchDtoo);
            if (!profesores || profesores.length === 0) {
                throw new NotFoundException('No se encontraron profesores');
            }
            return profesores;
        } catch (error) {
            console.error('Error al buscar profesores:', error);
            throw new InternalServerErrorException('Error inesperado al buscar profesores');
        }
    }
}
