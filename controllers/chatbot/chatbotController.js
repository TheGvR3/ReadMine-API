import Groq from "groq-sdk";
import { errorLogger } from "../../middlewares/errorLogger.js";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Funzione per chiamare le tue API interne
async function fetchInternalAPI(endpoint, token, method = 'GET', body = null) {
    const baseURL = process.env.API_BASE_URL || 'https://read-mine-api.vercel.app';

    try {
        const options = {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${baseURL}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Errore chiamata a ${endpoint}:`, error.message);
        await errorLogger(`[fetchInternalAPI] - Errore chiamata a ${endpoint}: ${error.message}\n`).catch(console.error);
        return null;
    }
}

// Funzione per determinare l'intento dell'utente
async function detectIntent(userInput) {
    const intentPrompt = `
Analizza questa richiesta e determina l'intento dell'utente.
Rispondi SOLO con un JSON in questo formato:
{
  "intent": "get_books" | "search_book" | "recommend_books" | "search_series" | "general_chat",
  "genre": "fantasy" | "giallo" | "romanzo" | "storico" | "thriller" | null,
  "search_term": "termine di ricerca" | null,
  "series_name": "nome della serie" | null
}

Esempi:
- "Quali libri fantasy mi consigli?" → intent: "recommend_books", genre: "fantasy"
- "Cercami il libro 1984" → intent: "search_book", search_term: "1984"
- "Mostrami i libri della serie Harry Potter" → intent: "search_series", series_name: "Harry Potter"
- "Ciao come stai?" → intent: "general_chat"

Richiesta utente: "${userInput}"
`;

    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: intentPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 200
        });

        const jsonText = response.choices[0].message.content
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Errore nel riconoscimento intento:', error);
        await errorLogger(`[detectIntent] - Errore nel riconoscimento intento: ${error.message}\n`).catch(console.error);
        return { intent: 'general_chat', genre: null, search_term: null, series_name: null };
    }
}

export async function generateAIResponse(req, res) {
    const { userInput } = req.body;
    
    // Estrai il token dall'header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    try {
        // Validazione input
        if (!userInput || userInput.trim() === '') {
            await errorLogger(`[generateAIResponse] - Input utente mancante o vuoto`).catch(console.error);
            return res.status(400).json({ error: 'Input utente richiesto' });
        }

        // Verifica che ci sia un token
        if (!token) {
            await errorLogger(`[generateAIResponse] - Token di autenticazione mancante`).catch(console.error);
            return res.status(401).json({ error: 'Token di autenticazione mancante' });
        }

        // 1. Rileva l'intento dell'utente
        const intent = await detectIntent(userInput);
        console.log('Intent rilevato:', intent);

        let contextData = null;
        let systemPrompt = "Sei un assistente utile e cordiale per una libreria digitale.";

        // 2. Gestisci i vari intenti
        if (intent.intent === 'get_books' || intent.intent === 'recommend_books') {
            // Chiama la tua API per ottenere le opere
            const opere = await fetchInternalAPI('/opere', token);

            if (opere && opere.length > 0) {
                // Filtra per genere se specificato
                if (intent.genre) {
                    contextData = opere.filter(opera =>
                        opera.genere?.toLowerCase().includes(intent.genre.toLowerCase())
                    );
                } else {
                    contextData = opere;
                }

                systemPrompt = `Sei un esperto bibliotecario. Hai accesso a questo catalogo di ${contextData.length} libri:
${JSON.stringify(contextData.slice(0, 20), null, 2)}

Fornisci consigli basati su questi dati reali. Cita titoli, autori e generi presenti nel catalogo.
${contextData.length > 20 ? `Nota: ci sono altri ${contextData.length - 20} libri disponibili oltre a questi.` : ''}`;
            } else {
                systemPrompt = "Sei un assistente bibliotecario. Al momento non ho trovato libri nel catalogo. Rispondi comunque in modo utile e gentile.";
            }
        } 
        else if (intent.intent === 'search_book' && intent.search_term) {
            // Ricerca specifica di un libro
            const opere = await fetchInternalAPI(`/opere/search/${encodeURIComponent(intent.search_term)}`, token);

            if (opere && opere.length > 0) {
                contextData = opere;
                systemPrompt = `L'utente sta cercando informazioni su "${intent.search_term}". 
Ecco i ${opere.length} risultati trovati nel database:
${JSON.stringify(contextData, null, 2)}

Presenta questi risultati in modo chiaro e utile, includendo titolo, autore, genere e anno se disponibili.`;
            } else {
                systemPrompt = `L'utente sta cercando "${intent.search_term}" ma non ho trovato risultati nel catalogo. Rispondi in modo gentile e proponi di cercare qualcosa di simile o di diverso genere.`;
            }
        }
        else if (intent.intent === 'search_series' && intent.series_name) {
            // 2.1 Prima recupera tutte le serie
            const serie = await fetchInternalAPI('/serie', token);
            
            if (serie && serie.length > 0) {
                // 2.2 Trova la serie che corrisponde al nome cercato
                const serieCorrispondente = serie.find(s => 
                    s.nome_serie?.toLowerCase().includes(intent.series_name.toLowerCase())
                );

                if (serieCorrispondente) {
                    // 2.3 Recupera tutte le opere di quella serie usando l'id_serie
                    const opere = await fetchInternalAPI(`/opere/serie/${serieCorrispondente.id_serie}`, token);
                    
                    if (opere && opere.length > 0) {
                        contextData = opere;
                        systemPrompt = `L'utente sta cercando i libri della serie "${serieCorrispondente.nome_serie}".
Ecco i ${opere.length} libri trovati in questa serie:
${JSON.stringify(contextData, null, 2)}

Presenta questi libri in ordine (se disponibile), con titolo, autore e altre informazioni rilevanti.`;
                    } else {
                        systemPrompt = `Ho trovato la serie "${serieCorrispondente.nome_serie}" ma non ci sono libri associati a questa serie nel catalogo.`;
                    }
                } else {
                    // Serie non trovata
                    systemPrompt = `Non ho trovato una serie con il nome "${intent.series_name}" nel catalogo. Rispondi in modo gentile e suggerisci di verificare il nome o cercare qualcos'altro.`;
                }
            } else {
                systemPrompt = "Non ho trovato serie nel catalogo. Rispondi in modo gentile.";
            }
        }

        // 3. Genera la risposta con il contesto
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userInput }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024
        });

        const generatedText = chatCompletion.choices[0]?.message?.content;

        if (!generatedText) {
            throw new Error('Nessuna risposta generata');
        }

        res.status(200).json({
            message: 'Risposta generata con successo',
            response: generatedText,
            intent: intent.intent,
            dataUsed: contextData ? contextData.length : 0
        });

    } catch (error) {
        await errorLogger(`[generateAIResponse] - Errore: ${error.message}\nStack: ${error.stack}\n`).catch(console.error);
        res.status(500).json({
            error: 'Errore durante la generazione della risposta',
            details: error.message
        });
    }
}