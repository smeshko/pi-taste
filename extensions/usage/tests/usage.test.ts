import assert from "node:assert/strict";
import { test } from "node:test";
import usageExtension from "../../usage.ts";

// Exercise the registered command without credentials, network access, or a real TUI.
async function runUsage(provider: string, oauth: boolean, status = 200) {
	let command: any;
	let requests = 0;
	let lines: string[] = [];
	const originalFetch = globalThis.fetch;
	const theme = { fg: (_color: string, text: string) => text, bold: (text: string) => text };
	globalThis.fetch = async () => {
		requests++;
		return new Response(JSON.stringify({
			plan_type: "plus",
			rate_limit: { primary_window: { used_percent: 25, limit_window_seconds: 18000 } },
		}), { status });
	};
	try {
		usageExtension({
			on() {},
			events: { emit() {} },
			registerCommand(_name: string, definition: any) { command = definition; },
		} as any);
		await command.handler("", {
			model: { provider, id: "test-model" },
			modelRegistry: {
				isUsingOAuth: () => oauth,
				getApiKeyAndHeaders: async () => ({ ok: true, apiKey: "fake-test-token" }),
			},
			hasUI: true,
			ui: {
				theme,
				custom: async (factory: any) => {
					lines = factory({}, theme, {}, () => {}).render(100);
				},
			},
		});
		return { requests, text: lines.join("\n") };
	} finally {
		globalThis.fetch = originalFetch;
		globalThis.piCodexLimit = undefined;
	}
}

for (const provider of ["openai", "openai-2", "openai-codex", "openai-codex-2", "chatgpt"]) {
	test(`${provider} OAuth fetches subscription quota`, async () => {
		const result = await runUsage(provider, true);
		assert.equal(result.requests, 1);
		assert.match(result.text, /Codex rate limits/);
		assert.match(result.text, /25% used/);
		assert.match(result.text, /o open Codex usage/);
	});
}

test("OpenAI API keys retain billing dashboard and do not fetch subscription quota", async () => {
	const result = await runUsage("openai", false);
	assert.equal(result.requests, 0);
	assert.doesNotMatch(result.text, /Codex rate limits/);
	assert.match(result.text, /o open OpenAI usage/);
});

test("failed subscription fetch still offers Codex dashboard", async () => {
	const result = await runUsage("openai", true, 403);
	assert.equal(result.requests, 1);
	assert.match(result.text, /No provider usage/);
	assert.match(result.text, /o open Codex usage/);
});

test("unrelated OAuth providers do not fetch ChatGPT quota", async () => {
	const result = await runUsage("anthropic", true);
	assert.equal(result.requests, 0);
	assert.match(result.text, /o open Anthropic usage/);
});
