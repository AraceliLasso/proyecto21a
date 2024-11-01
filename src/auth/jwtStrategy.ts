import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token JWT del encabezado de autorización
      ignoreExpiration: false, // Verifica que el token no esté expirado
      secretOrKey: configService.get('JWT_SECRET'), // Utiliza la clave secreta para verificar el token
    });
}

  // Este método se ejecuta si el token es válido
    async validate(payload: any) {
      console.log("Payload from token:", payload);
    // Aquí puedes devolver cualquier dato que quieras que esté disponible en el contexto de la solicitud
    return { userId: payload.sub, email: payload.email};
    }
}
