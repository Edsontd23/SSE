const express = require('express');
const SSE = require('express-sse');
const cors = require('cors'); // Importa el paquete cors
const { Client } = require('pg');
const http = require('http');

const app = express();
const sse = new SSE();

const client = new Client({
    host: 'host',
    user: 'user',
    password: 'password',
    database: 'db',
    port: 1111, //port
});

client.connect();

// Middleware para permitir CORS
app.use(cors());

// Ruta para SSE
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (message) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  };

  // Escuchar cambios en la base de datos
  client.query('LISTEN trigger'); /// En lugar de triger ira el evento de la Db a escuchar

  client.on('notification', (msg) => {

    console.log(msg)
    let data_crm = JSON.parse(msg.payload);
    console.log(data_crm)
    const apiURL = 'url-API'+data_crm.id_crm;

    // Realizar la solicitud GET
    http.get(apiURL, {method: 'GET'}, (res) => {
        let data = '';

        // Recibir datos en fragmentos
        res.on('data', (chunk) => { data += chunk; });

        // La respuesta completa ha sido recibida
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log('Datos recibidos:', JSON.parse(data));
                data_crm =  JSON.parse(data)
                sendEvent(data_crm.data)
            } else {
                console.error(`Error al realizar la solicitud: ${res.statusCode}`);
            }
        });
    }).on('error', (err) => {
        console.error('Error al realizar la solicitud:', err.message);
    });
  });

  // Mantener la conexión abierta
  req.on('close', () => {
    res.end();
  });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});