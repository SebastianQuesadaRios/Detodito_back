const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI; // Asegúrate de que esta línea esté primero

// Agrega esta línea aquí para verificar que la URI esté correctamente cargada


// Crea un cliente MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const validatedb = async () => {
  try {
    await client.connect();
    console.log('Se conectó a MongoDB');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
  }
};

validatedb();

module.exports = client;
