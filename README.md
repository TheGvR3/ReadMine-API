# Letture — API

API Node.js per gestione utenti (auth JWT access+refresh), letture (autori, tipo, opere, serie) e logging errori.

## File chiave
- Server e rotte: [API/index.js](API/index.js)  
- Connessione DB: [API/db.js](API/db.js)  
- Variabili ambiente: [API/.env](API/.env)  
- Package: [API/package.json](API/package.json)  
- Script creazione DB: [db.sql](db.sql)

Controller principali:
- Auth: [`register`](API/controllers/auth/registerController.js), [`login`](API/controllers/auth/loginController.js), [`refreshToken`](API/controllers/auth/refreshTokenController.js), [`logout`](API/controllers/auth/logoutController.js) — vedi [API/controllers/auth/index.js](API/controllers/auth/index.js)  
- User: [`getUserProfile`](API/controllers/user/getUserController.js), [`updateProfile`](API/controllers/user/updateUserController.js), [`updatePassword`](API/controllers/user/updatePasswordController.js) — vedi [API/controllers/user/index.js](API/controllers/user/index.js)  
- Risorse letture: [API/controllers/letture/opereController.js](API/controllers/letture/opereController.js), [API/controllers/letture/autoriController.js](API/controllers/letture/autoriController.js), [API/controllers/letture/tipoController.js](API/controllers/letture/tipoController.js), [API/controllers/letture/serieController.js](API/controllers/letture/serieController.js)

Middleware importanti:
- Autenticazione: [`auth`](API/middlewares/auth.js)  
- Logging errori: [`errorLogger`](API/middlewares/errorLogger.js) — log: [API/log/log.txt](API/log/log.txt)  
- Validators: [API/middlewares/validators/authValidator.js](API/middlewares/validators/authValidator.js), [API/middlewares/validators/userValidator.js](API/middlewares/validators/userValidator.js), [API/middlewares/validators/opereValidator.js](API/middlewares/validators/opereValidator.js), [API/middlewares/validators/serieValidator.js](API/middlewares/validators/serieValidator.js), [API/middlewares/validators/letturaValidator.js](API/middlewares/validators/letturaValidator.js), [API/middlewares/validators/autoriValidator.js](API/middlewares/validators/autoriValidator.js), [API/middlewares/validators/idValidator.js](API/middlewares/validators/idValidator.js)

Route files:
- [API/routes/authRoutes.js](API/routes/authRoutes.js)  
- [API/routes/userRoutes.js](API/routes/userRoutes.js)  
- [API/routes/opereRoutes.js](API/routes/opereRoutes.js)  
- [API/routes/autoriRoutes.js](API/routes/autoriRoutes.js)  
- [API/routes/tipoRoutes.js](API/routes/tipoRoutes.js)  
- [API/routes/serieRoutes.js](API/routes/serieRoutes.js)  
- [API/routes/letturaRoutes.js](API/routes/letturaRoutes.js)

---

## Requisiti
- Node.js (v16+ consigliato)
- MySQL
- Creare DB ed eseguire [db.sql](db.sql)

## Installazione & avvio
```sh
cd API
npm install
# impostare le variabili in API/.env (DB_*, JWT_SECRET, JWT_REFRESH_SECRET, PORT)
node index.js
```

## Variabili d'ambiente richieste
- DB_HOST, DB_USER, DB_PASS, DB_NAME (usate in [API/db.js](API/db.js))
- JWT_SECRET, JWT_REFRESH_SECRET
- PORT (opzionale)

## Endpoints principali (riepilogo)
Auth ([API/routes/authRoutes.js](API/routes/authRoutes.js)):
- POST /auth/register -> [`register`](API/controllers/auth/registerController.js)
- POST /auth/login -> [`login`](API/controllers/auth/loginController.js)
- POST /auth/refresh -> [`refreshToken`](API/controllers/auth/refreshTokenController.js)
- POST /auth/logout -> [`logout`](API/controllers/auth/logoutController.js)

User (protette, middleware [`auth`](API/middlewares/auth.js), vedi [API/routes/userRoutes.js](API/routes/userRoutes.js)):
- GET /users/profile -> [`getUserProfile`](API/controllers/user/getUserController.js)
- PUT /users/profile/update -> [`updateProfile`](API/controllers/user/updateUserController.js)
- PUT /users/profile/updatePassword -> [`updatePassword`](API/controllers/user/updatePasswordController.js)

Risorse "Letture" (v. cartella controllers + route files sopra):
- Autori: /autori (CRUD)
- Tipo: /tipo (GET)
- Opere: /opere (CRUD + search + filtri)
- Serie: /serie (CRUD)
- Letture: /letture (CRUD)

Tutte le rotte protette richiedono header:
Authorization: Bearer <ACCESS_TOKEN>


## Logging & debug
- Gli errori sono appendati tramite [`errorLogger`](API/middlewares/errorLogger.js) in [API/log/log.txt](API/log/log.txt).
- I validator restituiscono errori formattati (vedi [API/middlewares/validators/handleValidators.js](API/middlewares/validators/handleValidators.js)).

---

Per dettagli implementativi consultare i file elencati sopra (controllers, routes, middlewares).  