import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import NyxEngine from "../ai/nyxEngine.js";

const router = express.Router();
const nyx = new NyxEngine();

// Middleware de autenticación
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Token requerido." });
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido." });
  }
}

// Endpoint principal de chat
router.post("/", auth, async (req, res) => {
  try {
    const { prompt, modeOverride } = req.body;
    const user = await User.findById(req.userId);
    const memory = user.memory || {};

    const response = nyx.respond(prompt, { modeOverride, memory });

    // Guardar chat
    const chat = new Chat({ userId: user._id, prompt, response });
    await chat.save();

    // Actualizar memoria del usuario (si quieres)
    user.memory.lastPrompt = prompt;
    await user.save();

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: "Error al procesar chat.", error: err.message });
  }
});

export default router;
