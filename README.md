
# Welcome to your Servify project

## Project info


## How can I edit this code?

There are several ways of editing your application.



The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Payments (Stripe)

1) Add keys to `.env` (already added here, replace with your own):

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
VITE_API_BASE_URL=http://localhost:4242
```

2) Start the Stripe backend (creates Checkout Sessions):

```sh
npm run dev:server
```

3) In another terminal, start the frontend:

```sh
npm run dev
```

4) Use the booking flow and click Pay Now (card payments redirect to Stripe Checkout). Use Stripe test cards like `4242 4242 4242 4242`, any future expiry, any CVC.

## How can I deploy this project?
Deploy to Vercel (static frontend + serverless API routes):

1. Set these Environment Variables in Vercel (Production & Preview):
	- `VITE_SUPABASE_URL`
	- `VITE_SUPABASE_PUBLISHABLE_KEY`
	- `VITE_SUPABASE_SERVICE_ROLE_KEY` (server-only secret; used by `/api/confirm-user`)
	- `STRIPE_SECRET_KEY` (server-only secret)
	- `APP_URL` (e.g., `https://your-project.vercel.app`)
	- `ALLOWED_ORIGINS` (comma-separated list; include your Vercel domain)
	- Optional: leave `VITE_API_BASE_URL` empty to use same-origin serverless routes on Vercel.

2. Import the repo in Vercel and use the defaults (root: `servify-connect`). Vercel auto-detects Vite and serves `/api/*` as serverless functions.

3. Deploy. The frontend will serve from `dist/` and API endpoints will be available under `/api/*` (e.g., `/api/create-checkout-session`, `/api/confirm-user`).

4. For local parity, run `vercel dev` (after installing the Vercel CLI). This serves Vite on port 5173 and API routes on `http://localhost:3000/api/*`. If you use `npm run dev` alone, also set `VITE_API_BASE_URL=http://localhost:3000` so the `/api` calls resolve.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
