# TxCrypto — Deployment Guide

## What's in this folder

```
txcrypto-site/
├── netlify.toml              ← Netlify configuration
├── netlify/
│   └── functions/
│       └── chat.js           ← Serverless function (holds your API key securely)
└── public/
    ├── index.html            ← Landing page (homepage)
    ├── app.html              ← The tax assistant app
    └── demo.html             ← No-login demo
```

## How it works

Users visit your site → chat in the app → their messages go to `/.netlify/functions/chat`
→ your Netlify function calls Anthropic using YOUR API key → response returned to user.

The user never sees your API key. It lives only in Netlify's secure environment variables.

---

## Deploy in 5 steps

### Step 1 — Get your Anthropic API key
1. Go to https://console.anthropic.com
2. Sign up / log in
3. Go to API Keys → Create Key
4. Copy the key (starts with `sk-ant-...`) — save it somewhere safe

### Step 2 — Create a Netlify account
1. Go to https://netlify.com
2. Sign up free with GitHub or email

### Step 3 — Deploy the site
1. Go to your Netlify dashboard
2. Drag and drop the entire `txcrypto-site` folder onto the dashboard
3. Netlify gives you a URL like `https://amazing-fox-123.netlify.app`
4. Your site is live

### Step 4 — Add your API key as an environment variable
This is the critical step — this is how your key stays secret.

1. In Netlify dashboard → your site → Site Configuration → Environment Variables
2. Click "Add a variable"
3. Key: `ANTHROPIC_API_KEY`
4. Value: `sk-ant-your-key-here`
5. Click Save
6. Go to Deploys → Trigger deploy → Deploy site (to pick up the new variable)

### Step 5 — Connect your domain
1. Buy `txcrypto.co.uk` on Namecheap (~£12/year)
2. In Netlify → Domain Management → Add custom domain
3. Follow Netlify's DNS instructions (takes ~1 hour to propagate)

---

## Testing it works

After deploying, open your site and open browser DevTools (F12) → Network tab.
Type a message in the chat. You should see a request to `/.netlify/functions/chat`
returning a 200 status. If you see a 500 error, your API key environment variable
isn't set correctly — double-check Step 4.

---

## Costs

| Service | Cost |
|---|---|
| Netlify hosting | Free (up to 100GB bandwidth/month) |
| Netlify Functions | Free (up to 125,000 calls/month) |
| Anthropic API | ~£0.01–0.05 per conversation |
| Domain | ~£12/year |
| **Total to launch** | **~£12** |

At £19/month per user, your first paying customer covers ~19 months of API costs.

---

## Security notes

- Your API key is stored in Netlify's encrypted environment variables
- It is never sent to users' browsers
- The function only accepts POST requests
- In production, update the CORS origin in `chat.js` from `*` to `https://txcrypto.co.uk`

---

## Next steps after deploying

1. Add user authentication (Supabase — free)
2. Add payments (Stripe — free until you charge someone)  
3. Add per-user rate limiting in `chat.js` (prevent abuse)
4. Build the Section 104 calculation engine (Python backend)
5. Add HMRC report PDF export

---

## Need help?

If the deployment fails, the most common issues are:
- Environment variable not saved before redeploying → retrigger the deploy
- `chat.js` syntax error → check the Netlify Functions log in the dashboard
- CORS error in browser → make sure you're accessing via the Netlify URL, not file://
