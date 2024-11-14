import { Usuario } from 'src/usuarios/usuario.entity';
import { DataSource, getRepository } from 'typeorm';
import { rolEnum } from 'src/usuarios/usuario.entity';
import * as bcrypt from 'bcryptjs'; // Si deseas encriptar las contraseñas

export const seedUsuarios = async (dataSource: DataSource) => {
  const usuarioRepository = dataSource.getRepository(Usuario);
  

  // Contraseñas por defecto, puedes personalizarlas
  const passwordAdmin = 'admin123';
  const passwordProfesor = 'profesor123';

  // Encriptando las contraseñas
  const hashedPasswordAdmin = await bcrypt.hash(passwordAdmin, 10);
  const hashedPasswordProfesor = await bcrypt.hash(passwordProfesor, 10);

  const usuarios = [
    {
      nombre: 'Administrador',
      edad: "30",
      telefono: "1234567890",
      email: 'admin@ejemplo.com',
      contrasena: hashedPasswordAdmin,
      rol: rolEnum.ADMIN,
    },
    {
      nombre: 'Profesor Juan',
      edad: "40",
      telefono: "9876543210",
      email: 'juan@ejemplo.com',
      contrasena: hashedPasswordProfesor,
      rol: rolEnum.PROFESOR,
    },
  ];

  for (const usuario of usuarios) {
    const usuariosExistentes = await usuarioRepository.findOne({
        where: { email: usuario.email } // Verifica si el usuario ya existe por su correo electrónico
    });

    if (!usuariosExistentes) {
        await usuarioRepository.save(usuario);
        console.log(`El usuario "${usuario.nombre}" no existe y se insertará.`)
    } else {
        console.log(`El usuario "${usuario.nombre}" ya existe y no se insertará.`);
    }
}
};
