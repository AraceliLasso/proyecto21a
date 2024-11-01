import { Body, Controller, Get, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { MailService } from 'src/notifications/mail.service';
import { ActualizarPerfilDto } from './dtos/actualizar-usuarioGoogle.dto';
import { UsuariosServicio } from 'src/usuarios/usuario.service';

@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService: AuthService,
        private readonly mailService: MailService, 
        private readonly usersService: UsuariosServicio,

    ) {}

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {
    // Esta función se activa cuando el usuario es redirigido a este endpoint por Google.
    // La autenticación se maneja automáticamente gracias al guardia AuthGuard.
    // Si el usuario no está autenticado, se redirigirá a Google para iniciar sesión.
    // Si el usuario ya está autenticado, se procederá a la siguiente función (callback).
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleAuthRedirect(@Req() req) {
    return {
        messedad: 'Usuario autenticado exitosamente',
        usuario: req.usuario,
    };
}

@Post('google-login')
async googleLogin(@Body() body: { token: string }) {

    try{
        const { token } = body;
        console.log("body", body)

        const decodedToken = await this.authService.verifyGoogleToken(token); // Verificando y decodificando el token JWT recibido
        
        // Enviar el perfil decodificado (que proviene del token) a validateOAuthLogin
        const{ usuario, esNuevoUsuario }= await this.authService.validateOAuthLogin(decodedToken);

        // Enviar correo de bienvenida si el usuario es nuevo
        if (esNuevoUsuario) { 
            setImmediate(() => {
            this.mailService.sendMail(
                usuario.email,
                'Bienvenido a JhonDay',
                'Gracias por registrarte.',
                '<h1>Te damos la bienvenida a JhonDay!!</h1><p>Gracias por registrarte.</p>',
        ).catch((error) => {
            console.error("Error al enviar correo de bienvenida:", error);
        });
    });
}
        const jwtToken = await this.authService.generateJwtToken(usuario); // Genera un token JWT para el usuario

        return {
            token: jwtToken,
            userData: {
                nombre: usuario.nombre,
                email: usuario.email,
                telefono: usuario.telefono || null,
                edad: usuario.edad || null,
                isProfileComplete: usuario.telefono && usuario.edad ? true : false // Solo verifica teléfono y edad
            },
        };
        
    }catch (error){
        console.error("Error al iniciar sesión con Google:", error);
        throw new UnauthorizedException('Error al iniciar sesión con Google');
    }
    
}
    @Patch('update-profile')
    @UseGuards(AuthGuard('jwt'))
    async actualizarPerfil(@Req() req, @Body() ActualizarPerfilDto: ActualizarPerfilDto) {
    const {email} = req.usuario;
    console.log("req.usuario", req.usuario)
    console.log("Email from token:", email);
    if (!email) {
        throw new UnauthorizedException('No se pudo obtener el email del token.');
    }

    return await this.usersService.actualizarPerfil(email, ActualizarPerfilDto);
    }

}
