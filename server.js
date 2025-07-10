const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const mqttClient = mqtt.connect('mqtt://localhost'); // Adapte si Mosquitto est distant

mqttClient.on('connect', () => {
  console.log('✅ MQTT connecté');
  mqttClient.subscribe('monitor/control/EnvQuery/Answer');
  mqttClient.subscribe('monitor/warnings/all');
});

mqttClient.on('message', (topic, message) => {
  const payload = message.toString();
  console.log(`📨 ${topic} : ${payload}`);
  io.emit('mqttMessage', { topic, payload });
});

io.on('connection', (socket) => {
  console.log('🔌 Client Socket.IO connecté');

  socket.on('manualEntry', (payload) => {
    const topic = 'monitor/control/EnvQuery/Manual';
    mqttClient.publish(topic, payload);
    console.log(`📤 Données manuelles publiées sur ${topic} : ${payload}`);
  });
});

server.listen(3000, () => {
  console.log('🌐 Interface disponible sur http://localhost:3000');
});
