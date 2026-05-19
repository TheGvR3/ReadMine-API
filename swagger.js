import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "ReadMine API",
            version: "1.2.0",
            description:
                "API per la gestione di letture (libri, manga, riviste), opere, autori, generi, serie e utenti. " +
                "Tutte le rotte ad eccezione di /auth/* richiedono un access token JWT nell'header Authorization.",
            contact: {
                name: "ReadMine",
                url: "https://read-mine.vercel.app",
            },
        },
        servers: [
            { url: "http://localhost:3000", description: "Sviluppo locale" },
            { url: "https://read-mine-api.vercel.app", description: "Produzione" },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Inserire il token JWT ottenuto da /auth/login",
                },
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "refreshToken",
                    description: "Refresh token impostato come cookie httpOnly al login",
                },
            },
            schemas: {
                Error: {
                    type: "object",
                    properties: {
                        error: { type: "string", example: "Messaggio di errore" },
                    },
                },
                ValidationError: {
                    type: "object",
                    properties: {
                        errors: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    msg: { type: "string" },
                                    path: { type: "string" },
                                    location: { type: "string" },
                                },
                            },
                        },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        email: { type: "string", format: "email", example: "user@example.com" },
                        nome: { type: "string", example: "Mario" },
                        cognome: { type: "string", example: "Rossi" },
                        data_nascita: { type: "string", format: "date", nullable: true, example: "1990-05-12" },
                        indirizzo: { type: "string", nullable: true, example: "Via Roma 1" },
                        telefono: { type: "string", nullable: true, example: "+39 333 1234567" },
                        created_at: { type: "string", format: "date-time" },
                        editor: { type: "boolean", example: false },
                    },
                },
                RegisterInput: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email" },
                        password: {
                            type: "string",
                            minLength: 8,
                            description:
                                "Almeno 8 caratteri con maiuscola, minuscola, numero e simbolo",
                        },
                        nome: { type: "string" },
                        cognome: { type: "string" },
                        data_nascita: { type: "string", format: "date" },
                        indirizzo: { type: "string" },
                        telefono: { type: "string" },
                    },
                },
                LoginInput: {
                    type: "object",
                    required: ["identifier", "password"],
                    properties: {
                        identifier: { type: "string", format: "email", example: "user@example.com" },
                        password: { type: "string", example: "Password1!" },
                    },
                },
                LoginResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Login effettuato con successo" },
                        accessToken: { type: "string", description: "JWT access token (validità 10m)" },
                        user: {
                            type: "object",
                            properties: {
                                id: { type: "integer" },
                                email: { type: "string", format: "email" },
                            },
                        },
                    },
                },
                ProfileUpdateInput: {
                    type: "object",
                    properties: {
                        email: { type: "string", format: "email" },
                        nome: { type: "string" },
                        cognome: { type: "string" },
                        data_nascita: { type: "string", format: "date" },
                        indirizzo: { type: "string" },
                        telefono: { type: "string" },
                    },
                },
                PasswordUpdateInput: {
                    type: "object",
                    required: ["oldPassword", "newPassword"],
                    properties: {
                        oldPassword: { type: "string" },
                        newPassword: {
                            type: "string",
                            minLength: 8,
                            description:
                                "Almeno 8 caratteri con maiuscola, minuscola, numero e simbolo",
                        },
                    },
                },
                EditorRequestHandleInput: {
                    type: "object",
                    required: ["requestId", "status"],
                    properties: {
                        requestId: { type: "integer", example: 12 },
                        status: { type: "string", enum: ["approved", "rejected"] },
                    },
                },
                Autore: {
                    type: "object",
                    properties: {
                        id_autore: { type: "integer", example: 1 },
                        nome_autore: { type: "string", example: "Italo Calvino" },
                    },
                },
                AutoreInput: {
                    type: "object",
                    required: ["nome_autore"],
                    properties: {
                        nome_autore: { type: "string", minLength: 2, example: "Italo Calvino" },
                    },
                },
                Genere: {
                    type: "object",
                    properties: {
                        id_genere: { type: "integer", example: 1 },
                        nome_genere: { type: "string", example: "Fantasy" },
                    },
                },
                GenereInput: {
                    type: "object",
                    required: ["nome_genere"],
                    properties: {
                        nome_genere: { type: "string", minLength: 2, example: "Fantasy" },
                    },
                },
                Tipo: {
                    type: "object",
                    properties: {
                        id_tipo: { type: "integer", example: 1 },
                        nome_tipo: { type: "string", example: "Libro" },
                    },
                },
                Serie: {
                    type: "object",
                    properties: {
                        id_serie: { type: "integer", example: 1 },
                        nome_serie: { type: "string", example: "Harry Potter" },
                    },
                },
                SerieInput: {
                    type: "object",
                    required: ["nome_serie"],
                    properties: {
                        nome_serie: { type: "string", maxLength: 100, example: "Harry Potter" },
                    },
                },
                Opera: {
                    type: "object",
                    properties: {
                        id_opera: { type: "integer", example: 1 },
                        titolo: { type: "string", example: "Naruto" },
                        tipo_opera: { type: "integer", example: 1 },
                        stato_opera: { type: "string", enum: ["finito", "in_corso"] },
                        id_serie: { type: "integer", nullable: true },
                        lingua_originale: { type: "string", nullable: true },
                        descrizione_opera: { type: "string", nullable: true },
                    },
                },
                OperaInput: {
                    type: "object",
                    required: ["titolo", "tipo_opera"],
                    properties: {
                        titolo: { type: "string", minLength: 2 },
                        tipo_opera: { type: "integer", minimum: 1 },
                        stato_opera: { type: "string", enum: ["finito", "in_corso"] },
                        id_serie: { type: "integer", nullable: true },
                        lingua_originale: { type: "string", nullable: true },
                        descrizione_opera: { type: "string", nullable: true },
                        autori: { type: "array", items: { type: "integer", minimum: 1 } },
                        generi: { type: "array", items: { type: "integer", minimum: 1 } },
                    },
                },
                Edizione: {
                    type: "object",
                    properties: {
                        id_edizione: { type: "integer", example: 1 },
                        id_opera: { type: "integer", example: 1 },
                        titolo_edizione: { type: "string", nullable: true, example: "Naruto vol. 5" },
                        isbn_issn: { type: "string", nullable: true },
                        editore: { type: "string", nullable: true },
                        anno_pubblicazione: { type: "integer", nullable: true },
                        numero_pagine: { type: "integer", nullable: true },
                        copertina_url: { type: "string", nullable: true },
                        google_volume_id: { type: "string", nullable: true },
                        lingua: { type: "string", nullable: true },
                        traduttore: { type: "string", nullable: true },
                        numero_volume: { type: "integer", nullable: true, example: 5 },
                    },
                },
                EdizioneInput: {
                    type: "object",
                    required: ["id_opera"],
                    properties: {
                        id_opera: { type: "integer", minimum: 1 },
                        titolo_edizione: { type: "string", nullable: true },
                        isbn_issn: { type: "string", nullable: true },
                        editore: { type: "string", nullable: true },
                        anno_pubblicazione: { type: "integer", nullable: true, minimum: 0, maximum: 2100 },
                        numero_pagine: { type: "integer", nullable: true, minimum: 1 },
                        copertina_url: { type: "string", nullable: true, format: "uri" },
                        google_volume_id: { type: "string", nullable: true },
                        lingua: { type: "string", nullable: true },
                        traduttore: { type: "string", nullable: true },
                        numero_volume: { type: "integer", nullable: true, minimum: 1 },
                    },
                },
                Lettura: {
                    type: "object",
                    properties: {
                        id_lettura: { type: "integer", example: 1 },
                        id_utente: { type: "integer", example: 1 },
                        id_opera: { type: "integer", example: 1 },
                        data_lettura: { type: "string", format: "date", nullable: true },
                        volume: { type: "integer", nullable: true },
                        capitolo: { type: "integer", nullable: true },
                        pagina: { type: "integer", nullable: true },
                        stato: {
                            type: "string",
                            enum: ["da_iniziare", "in_corso", "finito", "abbandonato"],
                        },
                        valutazione: { type: "integer", minimum: 1, maximum: 5, nullable: true },
                        note: { type: "string", nullable: true },
                    },
                },
                LetturaCreateInput: {
                    type: "object",
                    required: ["id_utente", "id_opera"],
                    properties: {
                        id_utente: { type: "integer", minimum: 1 },
                        id_opera: { type: "integer", minimum: 1 },
                        data_lettura: { type: "string", format: "date" },
                        volume: { type: "integer", minimum: 0 },
                        capitolo: { type: "integer", minimum: 0 },
                        pagina: { type: "integer", minimum: 0 },
                        stato: {
                            type: "string",
                            enum: ["da_iniziare", "in_corso", "finito", "abbandonato"],
                        },
                        valutazione: { type: "integer", minimum: 1, maximum: 5 },
                        note: { type: "string" },
                    },
                },
                LetturaUpdateInput: {
                    type: "object",
                    properties: {
                        data_lettura: { type: "string", format: "date" },
                        volume: { type: "integer", minimum: 0 },
                        capitolo: { type: "integer", minimum: 0 },
                        pagina: { type: "integer", minimum: 0 },
                        stato: {
                            type: "string",
                            enum: ["da_iniziare", "in_corso", "finito", "abbandonato"],
                        },
                        valutazione: { type: "integer", minimum: 1, maximum: 5 },
                        note: { type: "string" },
                    },
                },
                ChatbotInput: {
                    type: "object",
                    required: ["userInput"],
                    properties: {
                        userInput: {
                            type: "string",
                            example: "Quali libri fantasy mi consigli?",
                        },
                    },
                },
                ChatbotResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Risposta generata con successo" },
                        response: { type: "string", description: "Testo generato dall'AI" },
                        intent: {
                            type: "string",
                            enum: [
                                "get_books",
                                "search_book",
                                "recommend_books",
                                "search_series",
                                "general_chat",
                            ],
                        },
                        dataUsed: { type: "integer", description: "Numero di elementi usati come contesto" },
                    },
                },
            },
            responses: {
                Unauthorized: {
                    description: "Token mancante o non valido",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Error" },
                        },
                    },
                },
                NotFound: {
                    description: "Risorsa non trovata",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Error" },
                        },
                    },
                },
                ValidationError: {
                    description: "Errore di validazione input",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ValidationError" },
                        },
                    },
                },
                ServerError: {
                    description: "Errore interno del server",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Error" },
                        },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: "System", description: "Stato e diagnostica" },
            { name: "Auth", description: "Autenticazione e gestione sessione" },
            { name: "Users", description: "Profilo utente e richieste editor" },
            { name: "Autori", description: "Gestione autori" },
            { name: "Generi", description: "Gestione generi" },
            { name: "Tipi", description: "Tipi di opera (libro, manga, rivista...)" },
            { name: "Opere", description: "Gestione opere" },
            { name: "Serie", description: "Gestione serie" },
            { name: "Letture", description: "Letture degli utenti" },
            { name: "AI", description: "Chatbot AI bibliotecario" },
        ],
    },
    apis: ["./routes/*.js", "./index.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
