const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const router = express.Router();
const { login, register, reclamarCodigo, obtenerHistorialReclamos } = require('./controllers/margaritaControllers'); // Importa tanto login como register

// Cargar las variables de entorno correctamente
dotenv.config({ path: './config.env' });

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
   .then(() => {
       console.log('Conexión exitosa a MongoDB');
   })
   .catch(err => {
       console.error('Error al conectar a MongoDB:', err);
   });

// Ruta para el login
router.post('/login', login);
router.post('/register', register); // Asegúrate de que register esté definido y importado
router.post('/reclamar',reclamarCodigo); 
router.post('/historial', obtenerHistorialReclamos);

module.exports = router;
