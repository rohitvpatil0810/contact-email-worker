import { RESEND_API_URL } from '../constants/config';

export type EmailData = {
	receiver: string;
	subject: string;
	replyTo?: string;
};

type ResendSuccessResponse = {
	id: string;
};

type ResendErrorResponse = {
	name?: string;
	message?: string;
};

export const sendEmail = async (data: EmailData, email: string, env: Env) => {
	const response = await fetch(RESEND_API_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: env.RESEND_FROM,
			to: data.receiver,
			subject: data.subject,
			html: email,
			...(data.replyTo ? { reply_to: data.replyTo } : {}),
		}),
		signal: AbortSignal.timeout(10_000),
	});

	const body = await response.text();
	let result: ResendSuccessResponse | ResendErrorResponse = {};
	try {
		result = JSON.parse(body);
	} catch {
		// Non-JSON body (e.g. a gateway error page); fall through to the status check below.
	}

	if (!response.ok) {
		const error = result as ResendErrorResponse;
		throw new Error(
			`Resend API error (${response.status} ${error.name ?? 'unknown'}): ${error.message ?? (body || 'Unknown error')}`
		);
	}

	return result as ResendSuccessResponse;
};
