# SMTP Setup für Supabase Auth E-Mails

Damit Supabase Auth E-Mails von `alperen@adatepe.dev` sendet, musst du Resend über SMTP konfigurieren.

## Schritt 1: Resend SMTP Credentials holen

1. Gehe zu [Resend Dashboard](https://resend.com/dashboard)
2. Navigiere zu **Settings** → **SMTP**
3. Kopiere die SMTP-Einstellungen:
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `587` (oder `465` für SSL)
   - **SMTP Username**: `resend`
   - **SMTP Password**: Dein Resend API Key (z.B. `re_eyEyZ9Dh_6CAvZzVqtaE2in1mnC8fJyPf`)

## Schritt 2: Domain in Resend verifizieren

1. Gehe zu **Domains** in Resend Dashboard
2. Füge `adatepe.dev` hinzu
3. Verifiziere die DNS-Einträge (SPF, DKIM, DMARC)
4. Warte, bis die Domain als "Verified" markiert ist

## Schritt 3: SMTP in Supabase konfigurieren

### Via Dashboard (Empfohlen):

1. Gehe zu deinem [Supabase Dashboard](https://supabase.com/dashboard)
2. Wähle dein Projekt aus
3. Navigiere zu **Authentication** → **Providers** → **Email**
4. Scrolle zu **SMTP Settings**
5. Aktiviere **Enable Custom SMTP**
6. Fülle die Felder aus:

```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: re_eyEyZ9Dh_6CAvZzVqtaE2in1mnC8fJyPf
Sender Email: alperen@adatepe.dev
Sender Name: LLM Interface
```

7. Klicke auf **Save**

### Via Management API (Alternative):

```bash
# Get your access token from https://supabase.com/dashboard/account/tokens
export SUPABASE_ACCESS_TOKEN="your-access-token"
export PROJECT_REF="your-project-ref"

# Configure custom SMTP
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "external_email_enabled": true,
    "mailer_secure_email_change_enabled": true,
    "mailer_autoconfirm": false,
    "smtp_admin_email": "alperen@adatepe.dev",
    "smtp_host": "smtp.resend.com",
    "smtp_port": 587,
    "smtp_user": "resend",
    "smtp_pass": "re_eyEyZ9Dh_6CAvZzVqtaE2in1mnC8fJyPf",
    "smtp_sender_name": "LLM Interface"
  }'
```

## Schritt 4: E-Mail Templates anpassen

1. Gehe zu **Authentication** → **Email Templates** im Supabase Dashboard
2. Verwende die Templates aus `supabase-email-templates/`
3. Kopiere den HTML-Inhalt in die entsprechenden Template-Felder

## Wichtige Hinweise

- ✅ Die Domain `adatepe.dev` muss in Resend verifiziert sein
- ✅ Die Rate Limits sind zunächst auf 30 E-Mails/Stunde begrenzt (kann in Settings angepasst werden)
- ✅ E-Mails werden jetzt von `alperen@adatepe.dev` gesendet
- ⚠️ Stelle sicher, dass dein Resend API Key gültig ist

## Testen

Nach der Konfiguration:

1. Teste einen Signup
2. Überprüfe, ob die E-Mail von `alperen@adatepe.dev` kommt
3. Prüfe die Auth Logs in Supabase Dashboard bei Problemen
