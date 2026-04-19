import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Necesario para rutas absolutas en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("❌ Error MongoDB:", err));

// Rutas API
app.use("/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Servir frontend
app.use(express.static(path.join(__dirname, "frontend")));

// CATCH‑ALL EXPRESS 5 (sin patrones)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "main.html"));
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 NYX‑ORBIT backend activo en http://localhost:${PORT}`));
