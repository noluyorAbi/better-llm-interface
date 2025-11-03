# Supabase Email Templates

Alle E-Mail-Templates im Stil der Landing Page für Supabase Authentication.

## Templates

1. **confirm-signup.html** - Bestätigung der Registrierung
2. **magic-link.html** - Magic Link zum Anmelden
3. **reset-password.html** - Passwort zurücksetzen
4. **invite-user.html** - Benutzer einladen
5. **change-email.html** - E-Mail-Adresse ändern
6. **reauthentication.html** - Reauthentication (Bestätigungscode)

## Verwendung in Supabase

1. Gehe zu deinem Supabase Dashboard
2. Navigiere zu **Authentication** → **Email Templates**
3. Wähle das entsprechende Template aus
4. Kopiere den HTML-Inhalt aus der entsprechenden Datei
5. Füge ihn in das Supabase Template-Feld ein

## Verfügbare Variablen

- `{{ .ConfirmationURL }}` - Bestätigungslink
- `{{ .Token }}` - 6-stelliger OTP Code
- `{{ .TokenHash }}` - Gehashte Version des Tokens
- `{{ .SiteURL }}` - Deine Site URL
- `{{ .RedirectTo }}` - Redirect URL
- `{{ .Data }}` - User Metadata
- `{{ .Email }}` - Original E-Mail-Adresse
- `{{ .NewEmail }}` - Neue E-Mail-Adresse (nur bei Email Change)

## Design-Features

- ✅ Modernes Design im Stil der Landing Page
- ✅ Responsive für mobile Geräte
- ✅ Email-sichere Table-Layouts
- ✅ Inline Styles für maximale Kompatibilität
- ✅ Dark Mode Support (falls unterstützt)
- ✅ Konsistentes Branding
