# Vercel Deployment Checklist

## ✅ Fixed Issues

### 1. Missing `NEXT_PUBLIC_SITE_URL` Environment Variable

**Problem:** The email template in `src/lib/email.ts` was using `process.env.NEXT_PUBLIC_SITE_URL` which is not set in Vercel, resulting in broken admin dashboard links in emails.

**Solution:**

- Created `getSiteUrl()` helper function with fallback warning
- Updated email templates to use the helper function
- Created `.env.example` showing all required variables

---

## 🔧 Required Environment Variables for Vercel

Add these to your **Vercel Project Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

**Important:**

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` should be the same as local
- `SUPABASE_SERVICE_ROLE_KEY` is used for admin operations — keep it private
- `NEXT_PUBLIC_SITE_URL` must be your production domain (e.g., `https://mywebsite.com`)
- `RESEND_API_KEY` is for sending emails

---

## ✓ Architecture Review

### Supabase Configuration

- ✅ Server-side client uses `createServerSupabaseClient()` correctly
- ✅ Client-side client uses `createBrowserClient()` correctly
- ✅ Admin operations use `createAdminClient()` with service role key
- ✅ Middleware properly handles authentication redirects

### API Routes

- ✅ `/api/bookings` creates bookings with admin client
- ✅ `/api/admin/bookings` checks session before returning data
- ✅ Email notifications are non-blocking (don't fail booking if email fails)

### Email Service

- ✅ Resend API key check with graceful fallback
- ✅ Helper function `getSiteUrl()` prevents undefined URLs
- ✅ Owner and customer notifications implemented

### Authentication

- ✅ Middleware redirects unauthorized users to `/admin` login
- ✅ Session-based access control on admin dashboard

---

## 📝 Next Steps

1. **Go to Vercel Dashboard**
   - Select your project
   - Settings → Environment Variables
   - Add all variables from the checklist above

2. **Test Deployment**
   - Deploy to staging/production
   - Verify email links are correct
   - Check admin dashboard access

3. **Monitor Logs**
   - Check Vercel Logs for any runtime errors
   - Verify Sentry is capturing errors correctly

---

## 🐛 Other Potential Issues to Monitor

1. **Sentry Configuration**: Ensure `NEXT_PUBLIC_SENTRY_AUTH_TOKEN` is set (optional but recommended)
2. **CORS Issues**: If API calls fail, check Supabase RLS policies
3. **Rate Limiting**: Resend has rate limits — monitor email sending
4. **Database Connections**: Verify Supabase is accessible from Vercel IPs (no IP restrictions)
