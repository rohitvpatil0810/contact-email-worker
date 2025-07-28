import { checkAPIKey } from './middlewares/apiKeyMiddleware';
import validator from 'validator';
import { emailTemplates } from './constants/emailTemplates';
import { sendEmail } from './utility/sendEmail';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response(JSON.stringify({ success: false, error: 'Only POST requests are allowed.' }), {
				status: 405,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const isValidAPIKey = checkAPIKey(request, env);
		if (!isValidAPIKey) {
			return new Response(JSON.stringify({ success: false, error: 'Invalid API Key.' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const { name, email, message }: { name: string; email: string; message: string } = await request.json();

		try {
			if (!name || !email || !message) {
				return new Response(
					JSON.stringify({
						success: false,
						error: 'Please enter all details.',
					}),
					{
						status: 400,
						headers: {
							'Content-Type': 'application/json',
						},
					}
				);
			}

			if (!validator.isEmail(email)) {
				return new Response(
					JSON.stringify({
						success: false,
						error: 'Please enter a valid email.',
					}),
					{
						status: 400,
						headers: {
							'Content-Type': 'application/json',
						},
					}
				);
			}

			// Notification Email
			let notificationEmail = emailTemplates.notificationEmailTemplate({ name, email, message });

			let notificationEmailData = {
				receiver: env.MY_EMAIL,
				subject: 'New Message Alert! 📬',
			};

			let notificationEmailResult = await sendEmail(notificationEmailData, notificationEmail, env);

			// Thank you Email
			let thankYouEmail = emailTemplates.thankYouEmailTemplate({
				name,
			});

			let thankYouEmailData = {
				receiver: email,
				subject: 'Thank you for reaching out! 🎉',
			};

			let thankYouEmailResult = await sendEmail(thankYouEmailData, thankYouEmail, env);

			return new Response(
				JSON.stringify({
					success: true,
					msg: 'Thank you for reaching out! 🎉',
					notificationEmailResult,
					thankYouEmailResult,
				}),
				{
					status: 200,
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
		} catch (error) {
			console.log(error);
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Something went wrong. Please try again later.',
					errorDetails: error,
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
		}
	},
} satisfies ExportedHandler<Env>;
