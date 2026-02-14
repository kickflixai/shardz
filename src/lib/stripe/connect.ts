import { stripe } from "@/lib/stripe/client";

interface CreateConnectAccountParams {
	email: string;
	creatorUsername: string | null;
}

interface AccountStatus {
	chargesEnabled: boolean;
	payoutsEnabled: boolean;
	detailsSubmitted: boolean;
}

/**
 * Create a Stripe Express connected account for a creator.
 * Returns the account ID for storage in the profiles table.
 */
export async function createConnectAccount(
	params: CreateConnectAccountParams,
): Promise<string> {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL;
	const profileUrl = params.creatorUsername
		? `${appUrl}/creator/${params.creatorUsername}`
		: `${appUrl}`;

	const account = await stripe.accounts.create({
		type: "express",
		country: "US",
		email: params.email,
		capabilities: {
			transfers: { requested: true },
		},
		business_profile: {
			url: profileUrl,
		},
	});

	return account.id;
}

interface CreateAccountLinkParams {
	accountId: string;
	returnPath: string;
	refreshPath: string;
}

/**
 * Create an Account Link for Stripe Connect onboarding.
 * Returns the URL to redirect the creator to Stripe's hosted onboarding.
 */
export async function createAccountLink(
	params: CreateAccountLinkParams,
): Promise<string> {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL;

	const accountLink = await stripe.accountLinks.create({
		account: params.accountId,
		type: "account_onboarding",
		return_url: `${appUrl}${params.returnPath}`,
		refresh_url: `${appUrl}${params.refreshPath}`,
	});

	return accountLink.url;
}

/**
 * Retrieve the onboarding status of a Stripe Connect account.
 * Used to check if a creator has completed onboarding and is ready to receive transfers.
 */
export async function getAccountStatus(
	accountId: string,
): Promise<AccountStatus> {
	const account = await stripe.accounts.retrieve(accountId);

	return {
		chargesEnabled: account.charges_enabled ?? false,
		payoutsEnabled: account.payouts_enabled ?? false,
		detailsSubmitted: account.details_submitted ?? false,
	};
}
