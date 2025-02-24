require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } 
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

const MessageSchema = new mongoose.Schema({
    text: String,
    createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", MessageSchema);

// new message
app.post("/messages", async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const newMessage = new Message({ text });
    await newMessage.save();
    res.status(201).json(newMessage);
});

io.on("connection", (socket) => {
    console.log("🔵 A user connected");

    socket.on("sendMessage", async (message) => {
        const newMessage = new Message({ text: message });
        await newMessage.save();
        io.emit("newMessage", newMessage); 
    });

    socket.on("deleteMessage", async (id) => {
        await Message.findByIdAndDelete(id);
        io.emit("messageDeleted", id);
    });

    socket.on("editMessage", async ({ id, newText }) => {
        const updatedMessage = await Message.findByIdAndUpdate(id, { text: newText }, { new: true });
        io.emit("messageUpdated", updatedMessage);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
