const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const mqttClient = mqtt.connect('mqtt://localhost');  // si Mosquitto tourne en local

mqttClient.on('connect', () => {
  console.log('MQTT connecté');
  mqttClient.subscribe('monitor/control/EnvQuery/Answer');
  mqttClient.subscribe('monitor/warnings/all');
});

mqttClient.on('message', (topic, message) => {
  const payload = message.toString();
  console.log(`Message reçu sur ${topic} : ${payload}`);
  io.emit('mqttMessage', { topic, payload });
});

server.listen(3000, () => {
  console.log('Dashboard dispo sur http://localhost:3000');
});
