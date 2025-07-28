import nodemailer from 'nodemailer';

export type EmailData = {
	receiver: string;
	subject: string;
};

export const sendEmail = async (data: EmailData, email: string, env: Env) => {
	const transponder = nodemailer.createTransport({
		pool: true,
		host: 'smtp.gmail.com',
		port: 465,
		secure: true, // use TLS
		auth: {
			user: env.EMAIL,
			pass: env.EMAIL_PASSWORD,
		},
		tls: {
			// do not fail on invalid certs
			// rejectUnauthorized: false,
		},
	});

	let mailOptions = {
		from: env.EMAIL,
		to: data.receiver,
		subject: data.subject,
		html: email,
	};

	try {
		let result = await transponder.sendMail(mailOptions);
		return result;
	} catch (error) {
		throw error;
	}
};
