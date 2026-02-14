import Mux from "@mux/mux-node";

// Singleton Mux SDK client.
// Reads MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUX_SIGNING_KEY, MUX_PRIVATE_KEY,
// and MUX_WEBHOOK_SECRET from environment variables automatically.
export const mux = new Mux();
