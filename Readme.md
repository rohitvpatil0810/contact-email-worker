# Contact Email Worker

📬 A Cloudflare Workers-based TypeScript project for sending email notifications when users contact via Rohit’s portfolio website.

> 🔗 **Original Project (Node.js version):** [portfolio-mail-server](https://github.com/rohitvpatil0810/portfolio-mail-server)

---

## ✨ Features

- 📩 **Email Notifications**: Sends notification to Rohit and the sender when someone fills out the contact form.
- 📮 **Resend**: Delivers both emails through the [Resend](https://resend.com) HTTP API — no SMTP credentials or `nodemailer` required.
- ↩️ **Reply-To**: Replies to the notification go to the form submitter, and replies to the thank-you email go to your inbox.
- 🔐 **API Key Protection**: Secures the API endpoint using an API key.
- ☁️ **Cloudflare Workers**: Lightweight, serverless, and highly performant deployment using Cloudflare Workers.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/rohitvpatil0810/contact-email-worker.git
cd contact-email-worker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a file named `.dev.vars` in the root directory:

```dotenv
API_KEY="your_api_key"
MY_EMAIL="your_email_to_receive_notification@example.com"
RESEND_API_KEY="re_your_resend_api_key"
RESEND_FROM="Your Name <contact@your-verified-domain.com>"
SITE_DOMAIN="your-domain.com"
```

| Variable | Description |
| --- | --- |
| `API_KEY` | Value expected in the `x-api-key` request header. |
| `MY_EMAIL` | Inbox that receives the new-message notification. |
| `RESEND_API_KEY` | API key from [Resend](https://resend.com/api-keys). Keep this secret. |
| `RESEND_FROM` | Sender shown to recipients. The domain **must be verified in Resend**. |
| `SITE_DOMAIN` | Domain used in the notification subject, e.g. `New message from your-domain.com`. |

### 4. Set Up Resend

1. Create an account at [resend.com](https://resend.com) and add a domain under **Domains**.
2. Add the DNS records Resend provides and wait for the domain to show as **Verified**.
3. Create an API key and put it in `.dev.vars` as `RESEND_API_KEY`.

> 💡 Without a verified domain, Resend only allows sending from `onboarding@resend.dev`, and only to the email address of the Resend account owner.

For production, store the API key as a secret:

```bash
npx wrangler secret put RESEND_API_KEY
```

### 5. Start Local Development Server

```bash
npm run dev
```

This runs the Worker locally using [Wrangler](https://developers.cloudflare.com/workers/wrangler/).

---

## 📬 Usage

Send a `POST` request to the Worker’s email endpoint with the appropriate headers and body.

### Example using cURL:

```bash
curl -X POST http://localhost:8787/ \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{
    "name": "name_of_messager",
    "email": "email_of_messager",
    "message": "message_of_messager"
}'
```

---

## 🚢 Deployment

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put API_KEY
npm run deploy
```

`RESEND_FROM` and `SITE_DOMAIN` are set under `"vars"` in `wrangler.jsonc`. `MY_EMAIL` can be added there as well, or stored as a secret with `wrangler secret put`.

Once the first Resend send succeeds, the old SMTP secrets are no longer used:

```bash
npx wrangler secret delete EMAIL
npx wrangler secret delete EMAIL_PASSWORD
```

