# Contact Email Worker

📬 A Cloudflare Workers-based TypeScript project for sending email notifications when users contact via Rohit’s portfolio website.

> 🔗 **Original Project (Node.js version):** [portfolio-mail-server](https://github.com/rohitvpatil0810/portfolio-mail-server)

---

## ✨ Features

- 📩 **Email Notifications**: Sends notification to Rohit and the sender when someone fills out the contact form.
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
EMAIL="your_email_for_sending_notifications@example.com"
EMAIL_PASSWORD="your_email_password"
```

### 4. Start Local Development Server

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
