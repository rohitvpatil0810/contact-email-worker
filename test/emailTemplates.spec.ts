import { describe, it, expect } from 'vitest';
import { emailTemplates } from '../src/constants/emailTemplates';

describe('emailTemplates', () => {
	it('escapes markup in the thank-you email', () => {
		const html = emailTemplates.thankYouEmailTemplate({ name: '<script>alert("x")</script>' });

		expect(html).not.toContain('<script>');
		expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
	});

	it('escapes markup in the notification email', () => {
		const html = emailTemplates.notificationEmailTemplate({
			name: '<b>Jane</b>',
			email: 'jane+"><img src=x onerror=alert(1)>@example.com',
			message: '<img src="https://tracker.example/pixel.gif">',
		});

		expect(html).not.toContain('<b>Jane</b>');
		expect(html).not.toContain('<img');
		expect(html).toContain('&lt;b&gt;Jane&lt;/b&gt;');
		expect(html).toContain('&lt;img src=&quot;https://tracker.example/pixel.gif&quot;&gt;');
	});

	it('escapes ampersands exactly once', () => {
		const html = emailTemplates.notificationEmailTemplate({ name: 'Tom & Jerry', email: 'a@b.com', message: 'x' });

		expect(html).toContain('Tom &amp; Jerry');
		expect(html).not.toContain('&amp;amp;');
	});

	it('keeps line breaks in the message', () => {
		const html = emailTemplates.notificationEmailTemplate({
			name: 'Jane',
			email: 'jane@example.com',
			message: 'First line\nSecond line\r\nThird line',
		});

		expect(html).toContain('First line<br />Second line<br />Third line');
	});

	it('leaves plain text untouched', () => {
		const html = emailTemplates.notificationEmailTemplate({
			name: 'Jane Doe',
			email: 'jane@example.com',
			message: 'Hello there!',
		});

		expect(html).toContain('Jane Doe');
		expect(html).toContain('jane@example.com');
		expect(html).toContain('Hello there!');
	});
});
