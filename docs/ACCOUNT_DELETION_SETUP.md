# Account Deletion Setup

## Environment Variable Required

To enable account deletion, you need to add the Supabase **Service Role Key** to your environment variables.

### Steps:

1. **Get your Service Role Key:**
   - Go to your Supabase project dashboard
   - Navigate to **Settings** → **API**
   - Copy the **`service_role`** key (NOT the `anon` key)
   - ⚠️ **Important**: Never expose this key in client-side code!

2. **Add to your `.env.local` file:**

   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **For production:**
   - Add the `SUPABASE_SERVICE_ROLE_KEY` to your hosting platform's environment variables
   - For Vercel: Settings → Environment Variables
   - For other platforms: Check their documentation for environment variable setup

## Security Note

The service role key bypasses Row Level Security (RLS) and has admin privileges. It should:

- ✅ Only be used in server-side code (API routes, server actions)
- ✅ Never be exposed to the client
- ✅ Never be committed to git
- ✅ Be kept secure and rotated if compromised

## How It Works

The account deletion flow:

1. User confirms deletion by typing "DELETE"
2. Frontend calls `/api/user/delete` endpoint
3. Server verifies user authentication
4. Server uses admin client with service role key to delete the user
5. User is signed out and redirected to login

The API route will return an error if the service role key is not configured, providing clear feedback about what's missing.
