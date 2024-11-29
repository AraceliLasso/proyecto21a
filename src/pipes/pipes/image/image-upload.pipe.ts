import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ImageUploadPipe implements PipeTransform {
  private readonly allowedMimeType= [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif'
  ];

  private readonly maxSizeInBytes = 10485760; //10MB

  transform(file: Express.Multer.File ) {
    if(!file){
      throw new BadRequestException('Ningun archivo subido')
    }

    if(!this.allowedMimeType.includes(file.mimetype)){
      throw new BadRequestException('Tipo de archivo inválido')
    }

    if(file.size > this.maxSizeInBytes){
      throw new BadRequestException('Archivo demasiado grande')
    }
    return file;
  }
}
