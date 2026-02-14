import Stripe from "stripe";

// Singleton Stripe SDK client.
// Reads STRIPE_SECRET_KEY from environment variables.
// Used for Checkout sessions, webhooks, Connect operations, and transfers.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	typescript: true,
});
