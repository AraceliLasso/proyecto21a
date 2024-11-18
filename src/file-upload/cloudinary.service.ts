import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { v2 as cloudinary, UploadApiOptions} from 'cloudinary';


@Injectable()
export class CloudinaryService {
    constructor(){
        dotenv.config({
            path: '.env'
        });
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }

    async uploadFile(buffer: Buffer, originalName?: string): Promise<string>{
        const options: UploadApiOptions = {
            folder: 'upload', 
            public_id: originalName,
            resource_type: 'auto' 
        }

        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                options,
                (error, result) => {
                    error ? reject(error) : resolve(result.secure_url)
                },
            );
            stream.write(buffer);
            stream.end();
        })
    }

    // Método para eliminar un archivo de Cloudinary
    async deleteFile(publicId: string): Promise<void> {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            if (result.result === 'ok') {
                console.log(`Archivo con public_id ${publicId} eliminado exitosamente.`);
            } else {
                throw new Error(`Error al eliminar el archivo con public_id ${publicId}`);
            }
        } catch (error) {
            console.error('Error al eliminar el archivo de Cloudinary:', error);
            throw new Error('Error al eliminar el archivo de Cloudinary');
        }
    }


}
