const fs = require('fs/promises'); // Importa el módulo de archivos (opcional, dependiendo de tu lógica)
const path = require('path'); // Importa el módulo de rutas (opcional, dependiendo de tu lógica)
const CryptoJS = require('crypto-js');
const pool = require('../../database/mongo'); // Asegúrate de que la conexión a la base de datos está bien
const moment = require('moment-timezone'); // Importa moment-timezone una sola vez

// Lógica de login
const login = async (req, res) => {
  const datos = req.body; // Debe contener email y password
  console.log("Datos recibidos:", datos); // Para ver qué datos se reciben

  const hashedPassword = CryptoJS.SHA256(datos.password, process.env.CODE_SECRET_DATA).toString();
  console.log("SIN ENCRIPTAR: ", datos.password);
  console.log("HACKEO: ", hashedPassword);

  try {
      const login = await pool.db('margarita').collection('users').findOne({
          correo: datos.email, // Cambiado de email a correo
          password: hashedPassword
      });

      if (login) {
          // Aquí se procesa el login exitoso
          res.json({ status: "Bienvenido", user: datos.email, role: login.role });
      } else {
          res.json({ status: "ErrorCredenciales" });
      }
  } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};

const register = async (req, res) => {
  const { nombre, fecha, cedula, correo, celular, ciudad, contraseña } = req.body;

  const hashedPassword = CryptoJS.SHA256(contraseña, process.env.CODE_SECRET_DATA).toString();

  try {
      const existingUser = await pool.db('margarita').collection('users').findOne({ correo });
      if (existingUser) {
          return res.status(400).json({ status: "Error", message: "El correo ya está en uso" });
      }

      const newUser = {
          nombre,
          fecha,
          cedula,
          correo,
          celular,
          ciudad,
          password: hashedPassword,
          role: 'user'
      };

      await pool.db('margarita').collection('users').insertOne(newUser);
      res.status(201).json({ status: "Éxito", message: "Usuario registrado correctamente" });
  } catch (error) {
      console.error('Error al registrar el usuario:', error);
      res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};

const reclamarCodigo = async (req, res) => {
    const { correo, codigoReclamado } = req.body;

    // Verificar que se recibieron los datos necesarios
    if (!correo || !codigoReclamado) {
        return res.status(400).json({ status: "Error", message: "Correo y código son requeridos" });
    }

    console.log("Solicitud de reclamación recibida:", req.body);

    try {
        // Buscar el código en la base de datos
        const codigo = await pool.db('margarita').collection('codigos').findOne({ codigo: codigoReclamado });

        if (!codigo) {
            return res.json({ status: "Error", message: "Código no encontrado" });
        }

        // Verificar si el código ya fue reclamado
        if (codigo.estado === "ya reclamado") {
            return res.json({ status: "Error", message: "El código ya fue reclamado" });
        }

        const fechaHora = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');

        // Actualizar el estado del código a "ya reclamado"
        const updateResult = await pool.db('margarita').collection('codigos').updateOne(
            { codigo: codigoReclamado },
            {
                $set: { estado: "ya reclamado", correoReclamador: correo, fechaHora }
            }
        );

        // Verificar si la actualización fue exitosa
        if (updateResult.modifiedCount === 0) {
            return res.json({ status: "Error", message: "No se pudo actualizar el código" });
        }

        // Guardar el log de la reclamación
        const logReclamacion = {
            correo,
            codigo: codigoReclamado,
            montoGanado: codigo.monto,
            fechaHora,
        };

        await pool.db('margarita').collection('logsReclamaciones').insertOne(logReclamacion);

        res.json({ status: "Éxito", message: "Código reclamado correctamente", montoGanado: codigo.monto });
    } catch (error) {
        console.error('Error al reclamar el código:', error);
        res.status(500).json({ status: "Error", message: "Error en el servidor" });
    }
};

const obtenerHistorialReclamos = async (req, res) => {
    const { correo } = req.body;

    try {
        // Consultar en logsReclamaciones para obtener el historial
        const historial = await pool.db('margarita').collection('logsReclamaciones').find({ correo }).toArray();

        if (historial.length > 0) {
            res.json({ status: "Éxito", historial });
        } else {
            res.json({ status: "SinHistorial", message: "No hay historial de reclamos para este usuario." });
        }
    } catch (error) {
        console.error('Error al obtener el historial de reclamos:', error);
        res.status(500).json({ status: "Error", message: "Error en el servidor" });
    }
};


// Exporta la función de login
module.exports = {
    login,
    register,
    reclamarCodigo,
    obtenerHistorialReclamos
};
