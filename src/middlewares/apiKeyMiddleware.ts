export const checkAPIKey = (req: Request, env: Env) => {
	const apiKey = req.headers.get('x-api-key');
	if (apiKey !== env.API_KEY) {
		return false;
	}
	return true;
};
