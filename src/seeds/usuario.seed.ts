import { Usuario } from 'src/usuarios/usuario.entity';
import { DataSource, getRepository } from 'typeorm';
import { rolEnum } from 'src/usuarios/usuario.entity';
import * as bcrypt from 'bcryptjs'; // Para encriptar las contraseñas


export const seedUsuarios = async (dataSource: DataSource) => {
  const usuarioRepository = dataSource.getRepository(Usuario);

  // Contraseñas por defecto
  const passwordAdmin = 'Admin123*';
  const passwordProfesor = 'Profesor123*';

  // Encriptando las contraseñas
  const hashedPasswordAdmin = await bcrypt.hash(passwordAdmin, 10);
  const hashedPasswordProfesor = await bcrypt.hash(passwordProfesor, 10);

  const usuarios = [
    {
      nombre: 'Administrador',
      email: 'admin@gmail.com',
      contrasena: hashedPasswordAdmin, // Asignando la contraseña hasheada
      confirmarContrasena: hashedPasswordAdmin, // Asegurándose de que las contraseñas coincidan
      edad: 30,
      telefono: 1234567890,
      rol: rolEnum.ADMIN,
    },
    {
      nombre: 'Profesor Juan',
      email: 'juan@gmail.com',
      contrasena: hashedPasswordProfesor, // Asignando la contraseña hasheada
      confirmarContrasena: hashedPasswordProfesor, // Asegurándose de que las contraseñas coincidan
      edad: 40,
      telefono: 1176543210,
      rol: rolEnum.PROFESOR,
    },
  ];

  // Insertar usuarios si no existen
  for (const usuario of usuarios) {
    const usuariosExistentes = await usuarioRepository.findOne({
      where: { email: usuario.email }, // Verifica si el usuario ya existe por su correo electrónico
    });

    if (!usuariosExistentes) {
      await usuarioRepository.save(usuario);
      console.log(`El usuario "${usuario.nombre}" no existe y se insertará.`);
    } else {
      console.log(`El usuario "${usuario.nombre}" ya existe y no se insertará.`);
    }
  }
};
