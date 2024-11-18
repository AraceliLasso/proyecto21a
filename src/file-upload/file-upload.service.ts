import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FileUploadDto } from './dto/file-upload.dto';
import { CloudinaryService } from './cloudinary.service';
import { ClasesService } from 'src/clases/clase.service';
import { CategoriesService } from 'src/categorias/categories.service';
import { UsuariosService } from 'src/usuarios/usuario.service';
import { ActualizarUsuarioDto } from 'src/usuarios/dtos/actualizar-usuario.dto';
import { ActualizarImagenUsuarioDto } from 'src/usuarios/dtos/actualizar-imagenusuario.dto';
import { ActualizarImagenClaseDto } from 'src/clases/dto/actualizar-imagenClase.dto';
import { ModificarClaseDto } from 'src/clases/dto/modificar-clase.dto';


@Injectable()
export class FileUploadService {
    constructor(private readonly cloudinaryService: CloudinaryService,
        private readonly clasesService: ClasesService,
        private readonly usuariosService: UsuariosService
    ){}

    async uploadFile(
        file: Express.Multer.File, 
        entityType: 'clase' |  'usuario',
        entityId?: string
    ){
        const fileUploadDto: FileUploadDto = {
            fieldname: file.fieldname,
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        }

        const url = await this.cloudinaryService.uploadFile(fileUploadDto.buffer, fileUploadDto.originalname)

        // Actualizar la URL de la imagen en la entidad correspondiente usando los servicios
        switch (entityType) {
            case 'clase':
                // Primero obtenemos la clase actual para no sobrescribir las demás propiedades
                const clase = await this.clasesService.findOne(entityId);  // Suponiendo que tienes un método findOne

                if (!clase) {
                throw new Error('Clase no encontrada');
            }

            // Crear una instancia del DTO con solo la imagen
            const actualizarImagenClaseDto: ActualizarImagenClaseDto = {
            imagen: url
            };

        // Actualizamos solo la propiedad imagen, manteniendo las demás propiedades intactas
        await this.clasesService.update(entityId, {
            ...clase,   // Propiedades existentes
            imagen: url, // Actualizamos solo la imagen
            categoriaId: clase.categoria.id 
        });

                break;
        case 'usuario':
            // Llamar a `actualizarUsuarios` pasando la URL en el DTO
            const actualizarImagenUsuarioDto: ActualizarImagenUsuarioDto = { imagen: url };
            await this.usuariosService.actualizarUsuarios(entityId, actualizarImagenUsuarioDto);
            break;
        default:
            throw new Error('Tipo de entidad no compatible');
        }
        //await this.productsRepository.updateProduct(productId, {imgUrl: url});
        return {imgUrl: url}
    }

    // Función para eliminar un archivo
    async deleteFile(publicId: string): Promise<void> {
        try {
            await this.cloudinaryService.deleteFile(publicId);  // Utilizando el servicio de Cloudinary
        } catch (error) {
            console.error('Error al eliminar el archivo de Cloudinary:', error);
            throw new InternalServerErrorException('Error al eliminar el archivo de Cloudinary');
        }
    }
}
