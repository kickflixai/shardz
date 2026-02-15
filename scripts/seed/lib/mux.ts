import Mux from "@mux/mux-node";

/**
 * Standalone Mux SDK client for seed scripts.
 * Auto-reads MUX_TOKEN_ID + MUX_TOKEN_SECRET from env.
 *
 * Requires env vars loaded via `tsx --env-file=.env.local`.
 */
export const mux = new Mux();
