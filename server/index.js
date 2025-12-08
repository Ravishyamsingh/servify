import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.PORT || 4242;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const appUrl = process.env.APP_URL || 'http://localhost:5173';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || `${appUrl},http://localhost:8080`).split(',').map(o => o.trim()).filter(Boolean);

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase service credentials are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is missing. Please set it in your .env file.');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST']
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/confirm-user', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
      filter: { email },
    });

    if (listError) {
      console.error('Failed to find user', listError);
      return res.status(500).json({ error: listError.message });
    }

    const user = userList?.users?.[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      email_confirmed_at: new Date().toISOString(),
    });

    if (updateError) {
      console.error('Failed to confirm user', updateError);
      return res.status(500).json({ error: updateError.message });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('confirm-user failed:', err);
    const message = err instanceof Error ? err.message : 'Unexpected error confirming user';
    return res.status(500).json({ error: message });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { amount, currency = 'inr', serviceName = 'Service payment', vendorName = 'Vendor', customerEmail, metadata = {} } = req.body || {};

    if (!amount || Number.isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: serviceName,
              description: `Vendor: ${vendorName}`,
            },
            unit_amount: Math.round(Number(amount)),
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment-cancelled`,
      customer_email: customerEmail,
      metadata,
    });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe session creation failed:', error);
    const message = error instanceof Error ? error.message : 'Unexpected error creating checkout session';
    return res.status(500).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`Stripe server listening on http://localhost:${port}`);
});
