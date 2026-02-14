/**
 * Price tier constants and utility functions.
 * These mirror the seed data in the price_tiers database table.
 */

export const PRICE_TIERS = [
	{ label: "Budget", priceCents: 299, displayPrice: "$2.99" },
	{ label: "Standard", priceCents: 499, displayPrice: "$4.99" },
	{ label: "Premium", priceCents: 799, displayPrice: "$7.99" },
	{ label: "Deluxe", priceCents: 999, displayPrice: "$9.99" },
	{ label: "Blockbuster", priceCents: 1499, displayPrice: "$14.99" },
] as const;

/**
 * Format a price in cents to a display string (e.g., 499 -> "$4.99").
 */
export function formatPrice(cents: number): string {
	const dollars = cents / 100;
	return `$${dollars.toFixed(2)}`;
}

/**
 * Calculate the bundle price for multiple seasons with a discount.
 * Sums individual season prices and applies the discount percentage.
 *
 * @param seasonPrices - Array of individual season prices in cents
 * @param discountPercent - Discount percentage (0-50)
 * @returns Discounted total in cents (rounded to nearest cent)
 */
export function calculateBundlePrice(
	seasonPrices: number[],
	discountPercent: number,
): number {
	const total = seasonPrices.reduce((sum, price) => sum + price, 0);
	const discount = Math.round(total * (discountPercent / 100));
	return total - discount;
}
