import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from 'src/usuarios/usuario.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private readonly usuariosService: UsuariosService, // Inyectamos el servicio de usuarios
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token JWT del encabezado de autorización
      ignoreExpiration: false, // Verifica que el token no esté expirado
      secretOrKey: configService.get('JWT_SECRET'), // Utiliza la clave secreta para verificar el token
    });
  }

  // Este método se ejecuta si el token es válido
  async validate(payload: any) {
    // Extraemos el userId del payload
    const { sub: userId } = payload;

    // Buscamos el usuario en la base de datos por su id
    const usuario = await this.usuariosService.obtenerUsuarioPorId(userId); // Debes tener un método en tu servicio de usuarios que obtenga el usuario por su id

    // Si el usuario no existe, lanzamos una excepción
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Devolvemos el objeto completo del usuario para que esté disponible en req.user
    return usuario; // Aquí devolveremos el objeto completo de Usuario
  }
}

