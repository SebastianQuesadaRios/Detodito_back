const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Para generar IDs únicos
const moment = require('moment-timezone'); // Para manejar la zona horaria de Colombia

// Conexión a MongoDB (ajusta la URI de tu base de datos)
mongoose.connect('mongodb+srv://juanquintero05:8pack2SVTFiAdCuY@juandacho.3pujv.mongodb.net/margarita?retryWrites=true&w=majority&appName=Juandacho', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.log("Error conectando a MongoDB:", err));

// Definimos el esquema de la colección "margarita"
const codigoSchema = new mongoose.Schema({
  id: { type: String, required: true },
  codigo: { type: String, required: true },
  monto: { type: Number, required: true },
  estado: { type: String, required: true }, // 'por reclamar' o 'ya reclamado'
  fecha: { type: String, required: true },
  hora: { type: String, required: true },
  usuarioId: { type: String } // id del usuario si ya ha sido reclamado
});

// Especificar la colección "margarita" en el modelo
const Codigo = mongoose.model('Codigo', codigoSchema);

// Generar los 400 códigos ganadores
async function generarCodigos() {
  const codigos = [];
  const totalGanadores = 400;
  const montos = {
    '1.000.000': 50,
    '50.000': 150,
    '10.000': 200
  };

  // Generar números únicos entre 000 y 999
  const numeros = [];
  while (numeros.length < totalGanadores) {
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    if (!numeros.includes(randomNum)) {
      numeros.push(randomNum);
    }
  }

  // Asignar los montos correspondientes a los códigos ganadores
  let indice = 0;
  for (const [monto, cantidad] of Object.entries(montos)) {
    for (let i = 0; i < cantidad; i++) {
      const ahora = moment().tz("America/Bogota");
      const fecha = ahora.format('YYYY-MM-DD');
      const hora = ahora.format('HH:mm:ss');

      codigos.push({
        id: uuidv4(), // Genera un ID único para cada código
        codigo: numeros[indice],
        monto: parseInt(monto.replace('.', '')), // Convierte el monto a número
        estado: 'por reclamar', // Todos los códigos empiezan como 'por reclamar'
        fecha,
        hora,
        usuarioId: null // No tiene usuario aún
      });
      indice++;
    }
  }

  // Insertar los códigos en la colección "margarita"
  try {
    await Codigo.insertMany(codigos);
    console.log("¡400 códigos ganadores insertados con éxito en la colección margarita!");
  } catch (error) {
    console.error("Error al insertar los códigos:", error);
  }
}

// Llamar a la función para generar los códigos
generarCodigos();
