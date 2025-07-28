export const emailTemplates = {
	thankYouEmailTemplate: ({ name }: { name: string }) =>
		`<p>Hi ${name},</p><p><br /></p><p>Thank you for your message via my portfolio site! 🎉 I'll be in touch shortly to discuss your inquiry. 😊</p><p><br /></p><p>Best regards,</p><p>Rohit Patil</p><p><br /></p><p><br /></p><p><br /></p><p><br /></p><p>&nbsp;</p>`,
	notificationEmailTemplate: ({ name, email, message }: { name: string; email: string; message: string }) =>
		`<p>Hello,</p><p><br /></p><p>You've got mail! 📬</p><p><br /></p><p>Sender's Name: ${name}</p><p>Sender's Email: ${email}</p><p>Message: ${message}</p><p><br /></p><p>Check it out when you get a chance. 😊</p><p><br /></p><p>Best regards,</p><p>Rohit Portfolio Email Server</p><p><br /></p><p><br /></p><p><br /></p><p><br /></p><p><br /></p><p><br /></p><p><br /></p><p>&nbsp;</p>`,
};
