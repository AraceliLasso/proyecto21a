import { Body, Controller, Get, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ActualizarPerfilDto } from './dtos/actualizar-usuarioGoogle.dto';
import { UsuariosService } from 'src/usuarios/usuario.service';
import { MailService } from 'src/notificaciones/mail.service';
import { LoginGoogleDto } from './dtos/login-usuarioGoogle.dto';

@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService: AuthService,
        private readonly mailService: MailService, 
        private readonly usersService: UsuariosService,

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
    async googleAuthRedirect(@Req() req) {
        if (!req.user) {
            console.log("req.user en endpoint google/callback", req.user)
            console.error('Usuario no autenticado');
            throw new UnauthorizedException('No se pudo autenticar al usuario');
        }
        console.log('Usuario autenticado:', req.user);
        return {
            message: 'Usuario autenticado exitosamente',
            usuario: req.user,
    };
}

@Post('google-login')
async loginWithGoogle(@Body() loginGoogleDto: LoginGoogleDto) {
    console.log('Datos recibidos en el backend:',loginGoogleDto);
    const usuario = await this.authService.autenticarUsuarioOAuth(loginGoogleDto);
    console.log("usuario en google-login", usuario)
    if (!usuario) {
        throw new UnauthorizedException('Credenciales invalidas');
    }
    // Si el usuario es nuevo, envía un correo de bienvenida
    //if (usuario.esNuevoUsuario) {
        //try {
        //     await this.mailService.sendMail(
        //         usuario.usuario.email,
        //         'Bienvenido a ForgeFit',
        //         'Gracias por registrarte.',
        //         '<h1>Te damos la bienvenida a ForgeFit!!</h1><p>Gracias por registrarte.</p>',
        //     );
        // } catch(error) {
        //         console.error("Error al enviar correo de bienvenida:", error);
        //     }
        // };
        return usuario;
    } catch (error) {
      throw error; // Propaga el error para que NestJS lo maneje
    }
}

    // @Patch('update-profile')
    // @UseGuards(AuthGuard('jwt'))
    // async actualizarPerfil(@Req() req, @Body() ActualizarPerfilDto: ActualizarPerfilDto) {
    // const {email} = req.usuario;
    // console.log("req.usuario", req.usuario)
    // console.log("Email from token:", email);
    // if (!email) {
    //     throw new UnauthorizedException('No se pudo obtener el email del token.');
    // }

    // return await this.usersService.actualizarPerfil(email, ActualizarPerfilDto);
    // }

//}
