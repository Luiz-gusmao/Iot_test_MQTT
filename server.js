const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mqtt = require('mqtt');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configurações do MQTT Broker
const mqttClient = mqtt.connect('mqtt://192.168.15.115', {
  username: 'adm',       // Nome de usuário MQTT
  password: 'abc123'     // Senha MQTT
});

mqttClient.on('connect', function () {
  console.log('Conectado ao MQTT Broker');
  mqttClient.subscribe('sensor/temperatura');
  mqttClient.subscribe('sensor/umidade');
});

mqttClient.on('message', function (topic, message) {
  io.emit(topic, message.toString()); // Encaminhar mensagens MQTT para os clientes WebSocket
});

// Configurações do servidor para servir o HTML e arquivos estáticos
app.use(express.static(__dirname));

// Rota para servir o arquivo HTML
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Iniciar o servidor na porta 3000
server.listen(3000, function () {
  console.log('Servidor rodando na porta 3000');
});

// Configurações do WebSocket
io.on('connection', function (socket) {
  console.log('Cliente WebSocket conectado');

  socket.on('intervalo', function (intervalo) {
    console.log('Enviando intervalo para o MQTT Broker:', intervalo);
    mqttClient.publish('sensor/intervalo', intervalo);
  });

  socket.on('disconnect', function () {
    console.log('Cliente WebSocket desconectado');
  });
});
