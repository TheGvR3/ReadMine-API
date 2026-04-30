import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import os from "os";
import cookieParser from 'cookie-parser';
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

//Routes
import routes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser()); // Cookie parser middleware
app.use(express.json()); //json body parser
app.use(express.urlencoded({ extended: true })); //urlencoded body parser (form data)

  const allowedOrigins = [
  "http://localhost:5173", // URL standard di Vite
  "https://read-mine.vercel.app" // Il tuo URL di produzione
];

const corsOptions = {
  origin: function (origin, callback) {
    // 1. Permetti richieste senza origin (come Postman o Mobile)
    // 2. Controlla se l'origin è nella lista dei permessi
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Refused for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["set-cookie"]
};

app.use(cors(corsOptions));
app.use(helmet()); //Sicurezza HTTP headers

// Swagger UI: sempre attivo in dev; in produzione richiede ENABLE_SWAGGER=true
const swaggerEnabled =
  process.env.NODE_ENV !== "production" || process.env.ENABLE_SWAGGER === "true";

if (swaggerEnabled) {
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: "ReadMine API Docs",
    })
  );
}

/**
 * @swagger
 * /:
 *   get:
 *     tags: [System]
 *     summary: Stato API
 *     security: []
 *     responses:
 *       200:
 *         description: API attiva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "API attiva" }
 *                 uptime: { type: string, example: "1234s" }
 *                 memoryUsage: { type: string, example: "78.45 MB" }
 */
app.get("/", (req, res) => {
  res.json({
    message: "API attiva",
    uptime: process.uptime().toFixed(0) + "s",
    memoryUsage: (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + " MB",
  });
});

/**
 * @swagger
 * /status:
 *   get:
 *     tags: [System]
 *     summary: Informazioni sulla macchina
 *     security: []
 *     responses:
 *       200:
 *         description: Info sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nome: { type: string }
 *                 version: { type: string }
 *                 release: { type: string }
 *                 arch: { type: string }
 *                 totalMem: { type: string }
 *                 freeMem: { type: string }
 *                 memoryUsage: { type: string }
 *                 uptime: { type: string }
 */
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
app.use((req, res) => { res.status(404).json({ error: "Endpoint non trovato" }); });
app.use((err, req, res, next) => {
  console.error("Errore:", err);
  res.status(500).json({ error: "Errore interno del server" });
});

// Avvia il server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
    if (swaggerEnabled) {
      console.log(`Swagger UI disponibile su http://localhost:${PORT}/api-docs`);
    }
  });
}

export default app;
