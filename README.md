TinyLink — URL Shortener (Next.js + Neon + Tailwind)

A minimal, production-ready URL shortener similar to Bit.ly.
Create short links, track clicks, view stats, and manage everything from a clean dashboard.

Live Demo → https://tinylink-ashy.vercel.app/

GitHub → https://github.com/saisivamani/tinylink

🚀 Features
🔗 URL Shortening

Create short links from long URLs

Optional custom shortcode

Validates URL before saving

Rejects duplicate custom codes (409)

📈 Click Tracking

/code stats page

Shows:

Total clicks

Created date

Last clicked

Redirect URL

🔁 Redirect

Visiting /abc123 → redirects via 302

Each visit increments click count

Updates last clicked timestamp

Redirect stops after deletion

🗑 Delete Link

Delete any existing link

Deleted shortcodes return 404

🏥 Healthcheck

/healthz endpoint returns:

{ "ok": true, "version": "1.0" }

🖥 UI / UX

Built with Tailwind CSS

Dashboard

Form validation

Functional table (copy, view, delete)

Responsive layout (mobile → desktop)

🧱 Tech Stack

Next.js 16 (Pages Router)

Neon Postgres

Tailwind CSS

Vercel Hosting

🗄 Database Schema
CREATE TABLE links (
  code VARCHAR(8) PRIMARY KEY,
  target_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  total_clicks BIGINT DEFAULT 0,
  last_clicked TIMESTAMPTZ
);

⚙️ Environment Variables

Create .env.local:

DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require


(Don’t expose your actual credentials.)

Also include .env.example:

DATABASE_URL=

▶️ Running the Project Locally
npm install
npm run dev


Visit:
http://localhost:3000

🌍 Deployment

Deployed on Vercel with Neon Postgres.
Hot reload, serverless APIs, instant DB.

📹 Video Walkthrough

Required in submission:

Dashboard overview

Creating a link

Redirect working

Stats page

Delete link

Health endpoint

Code walkthrough

/lib/db.js

/api/links.js

/api/links/[code].js

/pages/[code].js

/pages/code/[code].js

🤖 AI Usage

This project was built with assistance from ChatGPT.
Full transcript included in submission.

👤 Author

Sivamani Vanapalli
