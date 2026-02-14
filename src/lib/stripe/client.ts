import Stripe from "stripe";

// Lazy-initialized Stripe SDK singleton.
// Deferred initialization avoids build-time errors when STRIPE_SECRET_KEY
// is not available (e.g., during `next build` static page collection).
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
	if (!_stripe) {
		const key = process.env.STRIPE_SECRET_KEY;
		if (!key) {
			throw new Error("Missing STRIPE_SECRET_KEY environment variable");
		}
		_stripe = new Stripe(key, { typescript: true });
	}
	return _stripe;
}

/**
 * Stripe SDK client singleton.
 * Use this for Checkout sessions, webhooks, Connect operations, and transfers.
 * Lazily initialized on first access.
 */
export const stripe = new Proxy({} as Stripe, {
	get(_target, prop, receiver) {
		const instance = getStripe();
		const value = Reflect.get(instance, prop, receiver);
		if (typeof value === "function") {
			return value.bind(instance);
		}
		return value;
	},
});
