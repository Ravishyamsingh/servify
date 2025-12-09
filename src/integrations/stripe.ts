const API_BASE_URL = (() => {
  const envBase = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envBase) return envBase;

  if (import.meta.env.DEV) return 'http://localhost:3000';

  return '';
})();

export type CreateCheckoutSessionParams = {
  amountInMinor: number; // amount in smallest currency unit (e.g., paise)
  currency?: string;
  serviceName?: string;
  vendorName?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
};

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const response = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: params.amountInMinor,
      currency: params.currency ?? 'inr',
      serviceName: params.serviceName,
      vendorName: params.vendorName,
      customerEmail: params.customerEmail,
      metadata: params.metadata,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Unable to create checkout session');
  }

  return response.json() as Promise<{ url?: string; sessionId?: string }>;
}
