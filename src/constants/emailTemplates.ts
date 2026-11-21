export const emailTemplates = {
	thankYouEmailTemplate: ({ name }: { name: string }) =>
		`
        <div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #333333;">
            <p>Hi ${name},</p>

            <p>
                Thank you for reaching out through my portfolio website.
                I've received your message and will get back to you as soon as I can.
            </p>

            <p>
                Best regards,<br />
                Rohit Patil
            </p>
        </div>
        `,

	notificationEmailTemplate: ({ name, email, message }: { name: string; email: string; message: string }) =>
		`
        <div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #333333;">
            <p>Hi Rohit,</p>

            <p>
                Someone has reached out through your portfolio website.
            </p>

            <p>
                <strong>Name:</strong> ${name}<br />
                <strong>Email:</strong> ${email}
            </p>

            <p>
                <strong>Message:</strong>
            </p>

            <p>
                ${message}
            </p>

            <p>
                Best,<br />
                Portfolio Contact Form
            </p>
        </div>
        `,
};
