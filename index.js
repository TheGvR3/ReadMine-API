import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import os from "os";
import cookieParser from 'cookie-parser';

//Routes
import routes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser()); // Cookie parser middleware
app.use(express.json()); //json body parser
app.use(express.urlencoded({ extended: true })); //urlencoded body parser (form data)
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'https://tuo-progetto-frontend.vercel.app' // Aggiungi questo quando pubblichi il front
  ],  
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // I metodi HTTP permessi
  credentials: true,  // Abilita l'invio di cookie e credenziali
};

app.use(cors(corsOptions));
app.use(helmet()); //Sicurezza HTTP headers

// Rotta base di test
app.get("/", (req, res) => {
  res.json({
    message: "API attiva",
    uptime: process.uptime().toFixed(0) + "s",
    memoryUsage: (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + " MB",
  });
});

//Informazioni sulla macchina
app.get("/status", (req, res) => {
  const machine = {
    nome: os.type(),
    version: os.version(),
    release: os.release(),
    arch: os.arch(),
    totalMem: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    freeMem: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    memoryUsage: (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + " MB",
    uptime: `${(os.uptime() / 3600).toFixed(2)} h`,//aggiustare
  };
  res.json(machine);
});

// Collega tutte le rotte
app.use("/", routes);

// Gestione errori
app.use((req, res) => {res.status(404).json({ error: "Endpoint non trovato" });});
app.use((err, req, res, next) => {
  console.error("Errore:", err);
  res.status(500).json({ error: "Errore interno del server" });
});

// Avvia il server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));
}

export default app;