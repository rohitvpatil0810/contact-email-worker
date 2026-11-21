import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import worker from '../src/index';
import { sendEmail } from '../src/utility/sendEmail';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

const testEnv = {
	API_KEY: 'test-api-key',
	MY_EMAIL: 'owner@example.com',
	RESEND_API_KEY: 're_test_key',
	RESEND_FROM: 'Contact <contact@example.com>',
} satisfies Env;

const validBody = { name: 'Jane Doe', email: 'jane@example.com', message: 'Hello there!' };

const makeRequest = (body: unknown = validBody, apiKey = testEnv.API_KEY, method = 'POST') =>
	new IncomingRequest('https://example.com/', {
		method,
		headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
		body: method === 'POST' ? JSON.stringify(body) : undefined,
	});

const invoke = async (request: Request) => {
	const ctx = createExecutionContext();
	const response = await worker.fetch(request as never, testEnv, ctx);
	await waitOnExecutionContext(ctx);
	return response;
};

const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

const resendOk = () =>
	new Response(JSON.stringify({ id: 'email_123' }), { status: 200, headers: { 'Content-Type': 'application/json' } });

const sentPayload = (index: number) => {
	const init = fetchMock.mock.calls[index][1];
	return JSON.parse(String(init?.body));
};

beforeEach(() => {
	fetchMock.mockReset();
	fetchMock.mockImplementation(async () => resendOk());
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('sendEmail', () => {
	it('posts to the Resend API with bearer auth', async () => {
		const result = await sendEmail({ receiver: 'to@example.com', subject: 'Hi' }, '<p>Body</p>', testEnv);

		expect(result).toEqual({ id: 'email_123' });
		expect(fetchMock).toHaveBeenCalledTimes(1);

		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe('https://api.resend.com/emails');
		expect(init?.method).toBe('POST');
		expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer re_test_key');
		expect(JSON.parse(String(init?.body))).toEqual({
			from: testEnv.RESEND_FROM,
			to: 'to@example.com',
			subject: 'Hi',
			html: '<p>Body</p>',
		});
	});

	it('includes reply_to only when provided', async () => {
		await sendEmail({ receiver: 'to@example.com', subject: 'Hi', replyTo: 'jane@example.com' }, '<p>Body</p>', testEnv);

		expect(sentPayload(0).reply_to).toBe('jane@example.com');
	});

	it('throws a descriptive error when Resend rejects the request', async () => {
		fetchMock.mockImplementation(
			async () =>
				new Response(JSON.stringify({ name: 'validation_error', message: 'Invalid `from` field.' }), {
					status: 422,
					headers: { 'Content-Type': 'application/json' },
				})
		);

		await expect(sendEmail({ receiver: 'to@example.com', subject: 'Hi' }, '<p>Body</p>', testEnv)).rejects.toThrow(
			'Resend API error (422 validation_error): Invalid `from` field.'
		);
	});

	it('throws on a non-JSON error body', async () => {
		fetchMock.mockImplementation(async () => new Response('Bad Gateway', { status: 502 }));

		await expect(sendEmail({ receiver: 'to@example.com', subject: 'Hi' }, '<p>Body</p>', testEnv)).rejects.toThrow(
			'Resend API error (502 unknown): Bad Gateway'
		);
	});
});

describe('contact worker', () => {
	it('rejects non-POST requests', async () => {
		const response = await invoke(makeRequest(undefined, testEnv.API_KEY, 'GET'));

		expect(response.status).toBe(405);
		expect(await response.json()).toMatchObject({ success: false });
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('rejects an invalid API key', async () => {
		const response = await invoke(makeRequest(validBody, 'wrong-key'));

		expect(response.status).toBe(401);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('rejects a request with missing fields', async () => {
		const response = await invoke(makeRequest({ name: 'Jane Doe', email: 'jane@example.com' }));

		expect(response.status).toBe(400);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('rejects an invalid email address', async () => {
		const response = await invoke(makeRequest({ ...validBody, email: 'not-an-email' }));

		expect(response.status).toBe(400);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('sends the notification and the thank-you email', async () => {
		const response = await invoke(makeRequest());

		expect(response.status).toBe(200);
		expect(await response.json()).toMatchObject({ success: true });
		expect(fetchMock).toHaveBeenCalledTimes(2);

		expect(sentPayload(0)).toMatchObject({
			from: testEnv.RESEND_FROM,
			to: testEnv.MY_EMAIL,
			subject: 'New Message Alert! 📬',
			reply_to: 'jane@example.com',
		});
		expect(sentPayload(0).html).toContain('Hello there!');

		expect(sentPayload(1)).toMatchObject({
			from: testEnv.RESEND_FROM,
			to: 'jane@example.com',
			subject: 'Thank you for reaching out! 🎉',
		});
		expect(sentPayload(1).reply_to).toBeUndefined();
		expect(sentPayload(1).html).toContain('Jane Doe');
	});

	it('returns 500 when Resend fails', async () => {
		fetchMock.mockImplementation(
			async () =>
				new Response(JSON.stringify({ name: 'rate_limit_exceeded', message: 'Too many requests' }), {
					status: 429,
					headers: { 'Content-Type': 'application/json' },
				})
		);

		const response = await invoke(makeRequest());

		expect(response.status).toBe(500);
		expect(await response.json()).toMatchObject({ success: false });
	});
});
