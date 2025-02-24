require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io")
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {origin: "*"}
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected")).catch(err => console.log(err));

const MessageSchema = new mongoose.Schema({
    text: String,
    createdAt: {type: Date, default:Date.now}
});

const Message = mongoose.model("Message", MessageSchema);