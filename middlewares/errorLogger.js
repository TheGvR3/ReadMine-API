

export async function errorLogger(message) {
    try {
        const timestamp = new Date().toISOString();
        
        // Su Vercel, i log vanno inviati alla console.
        // Vercel li catturerà automaticamente nella sua dashboard.
        console.error(`[ERROR LOG] ${timestamp} - ${message}`);

    } catch (e) {
        // Questo catch ora scatterebbe solo se ci fossero errori di memoria
        console.error("Errore critico nel logger:", e);
    }
}



/*
import { promises as fs } from "fs";
import path from "path";
VECCHIA FUNZIONE PER SCRIVERE SU UN LOG FILE
export async function errorLogger(message) {
    const logDir = "./log";
    const logFile = path.join(logDir, "log.txt");

    try {
        // Se la cartella non esiste, la crea (ricorsivo = crea anche cartelle intermedie se servono)
        await fs.mkdir(logDir, { recursive: true });

        const timestamp = new Date().toISOString();
        await fs.writeFile(logFile, `${timestamp} - ${message}\n`, { flag: "a" }); // flag append
        //console.log("Nuovo ErrorLog scritto");

    } catch (e) {
        console.error("Errore nella scrittura del log:", e);
    }
}*/