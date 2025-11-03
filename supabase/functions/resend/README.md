# Resend Email Edge Function

This Supabase Edge Function sends emails using the Resend API.

## Prerequisites

1. **Create a Resend API Key**
   - Sign up at [resend.com](https://resend.com)
   - Navigate to API Keys in your dashboard
   - Create a new API key

2. **Verify your domain** (optional but recommended)
   - Add your domain in Resend dashboard
   - Verify DNS records as instructed

3. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

## Setup

### 1. Set the Resend API Key as a Secret

**For local development:**

Supabase automatically loads environment variables from a `.env` file. **This is the recommended method:**

**Method 1: Using .env file (RECOMMENDED - Easiest)**

1. Create a `.env` file in `supabase/functions/` directory:

```bash
# Create the file
echo "RESEND_API_KEY=re_eyEyZ9Dh_6CAvZzVqtaE2in1mnC8fJyPf" > supabase/functions/.env
```

2. Start Supabase (if not already running):

```bash
supabase start
```

3. Start the function:

```bash
# Option A: Automatic loading (if .env is in supabase/functions/)
supabase functions serve resend --no-verify-jwt

# Option B: Explicitly specify the .env file
supabase functions serve resend --no-verify-jwt --env-file .env
```

The `.env` file is automatically loaded by Supabase when located in `supabase/functions/`, or you can use the `--env-file` flag to explicitly specify the file path.

**Method 2: Export then start**

```bash
# 1. Export the variable
export RESEND_API_KEY="re_eyEyZ9Dh_6CAvZzVqtaE2in1mnC8fJyPf"

# 2. Start the function (in the SAME terminal session)
supabase functions serve resend --no-verify-jwt
```

**Method 3: Inline variable**

```bash
RESEND_API_KEY="re_eyEyZ9Dh_6CAvZzVqtaE2in1mnC8fJyPf" supabase functions serve resend --no-verify-jwt
```

**⚠️ IMPORTANT:**

- If you already started the function, you **MUST restart it** after setting the variable
- The function only reads environment variables when it starts
- Use `Ctrl+C` to stop the running function, then restart it
- The `.env` file is gitignored (it won't be committed to version control) - this is intentional for security

**For production (after deploying):**

```bash
supabase secrets set RESEND_API_KEY=re_eyEyZ9Dh_6CAvZzVqtaE2in1mnC8fJyPf
```

### 2. Test Locally

1. Start the Supabase local environment (if not already running):

```bash
supabase start
```

2. Start the function with the API key (see Method 1 or 2 above):

```bash
# Make sure you've exported the variable first, then:
supabase functions serve resend --no-verify-jwt
```

Test the function:

```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/resend' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{
    "from": "LLM Interface <alperen@adatepe.dev>",
    "to": "alperen.adatepe1905@gmail.com",
    "subject": "Hello World",
    "html": "<strong>it works!</strong>"
  }'
```

### 3. Deploy to Production

```bash
supabase functions deploy resend
```

Make sure to set the secret in production:

```bash
supabase secrets set RESEND_API_KEY=your-resend-api-key-here
```

## Usage

### Request Format

```json
{
  "from": "LLM Interface <onboarding@resend.dev>", // Optional, defaults to "LLM Interface <onboarding@resend.dev>"
  "to": "user@example.com", // Required: single email or array of emails
  "subject": "Your email subject", // Required
  "html": "<h1>Your HTML email content</h1>" // Required
}
```

### Example: Using with Email Templates

You can use this function with your HTML email templates from `supabase-email-templates/`:

```typescript
// Example: Send confirmation email
const response = await fetch(`${SUPABASE_URL}/functions/v1/resend`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "LLM Interface <noreply@yourdomain.com>",
    to: userEmail,
    subject: "Confirm your signup - LLM Interface",
    html: confirmationEmailTemplate, // Load from your HTML templates
  }),
});
```

### Response Format

**Success (200):**

```json
{
  "id": "email-id-from-resend"
}
```

**Error (400/500):**

```json
{
  "error": "Error message"
}
```

## Email Templates

The function can be used with any HTML email template. You have templates available in `supabase-email-templates/`:

- `confirm-signup.html` - User signup confirmation
- `magic-link.html` - Magic link login
- `reset-password.html` - Password reset
- `invite-user.html` - User invitation
- `change-email.html` - Email change confirmation
- `reauthentication.html` - Reauthentication code

## Security Notes

- The function uses JWT verification by default (can be disabled with `--no-verify-jwt` for local testing)
- Never expose your `RESEND_API_KEY` in client-side code
- Always use environment variables or Supabase secrets for API keys
- Consider rate limiting for production use

## Troubleshooting

**Error: "RESEND_API_KEY environment variable is not set"**

- Make sure you've set the secret: `supabase secrets set RESEND_API_KEY=your-key`

**Error: "Method not allowed"**

- The function only accepts POST requests

**Error: "Missing required fields"**

- Ensure your request includes `to`, `subject`, and `html` fields

**Emails not sending:**

- Verify your Resend API key is correct
- Check that your domain is verified in Resend (if using custom domain)
- Check Resend dashboard for delivery status and errors
