import bcrypt from "bcryptjs";
import { supabase } from "../../db.js";
import { Resend } from 'resend';
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function updatePassword(req, res) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;

  try {
    // Recupera l'utente
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .limit(1)
      .single();

    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }
    // Confronta la vecchia password
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Vecchia password errata" });
    }

    // Cifra la nuova password
    const hashed = await bcrypt.hash(newPassword, 10);

    if (oldPassword === newPassword) {
      return res.status(400).json({ error: "La nuova password deve essere diversa dalla vecchia password" });
    }


    // Aggiorna la password nel database
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashed })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    // 4. INVIO EMAIL CON RESEND
    // Se sei in modalità test senza dominio, 'from' deve essere 'onboarding@resend.dev'
    // 'to' deve essere la tua stessa email se non hai verificato un dominio.
    await resend.emails.send({
      from: 'Sicurezza <onboarding@resend.dev>',
      to: user.email,
      subject: '⚠️ Sicurezza Account: Password modificata',
      html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h2>Ciao ${user.nome || 'utente'},</h2>
                    <p>Ti informiamo che la password del tuo account ReadMine è stata appena **aggiornata con successo**.</p>
                    <p>Se non sei stato tu, ti preghiamo di contattare immediatamente il supporto.</p>
                    <hr />
                    <small>Questa è una notifica automatica di sicurezza non è spam.</small>
                </div>
            `
    });

    res.json({ message: "Password aggiornata e email di conferma inviata" });
  } catch (error) {
    await errorLogger(`[updatePassword] - Errore durante updatePassword per utente ${userId}: ${error.message}`);
    res.status(500).json({ error: "Errore durante l'aggiornamento della password" });
  }
}