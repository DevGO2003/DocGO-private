const env = {
  apiBaseUrl: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000',
  apiGatewayUrl: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000',
  isDev: import.meta.env.DEV,
};

if (!env.apiBaseUrl) {
  console.error('VITE_API_GATEWAY_URL is not defined in .env file');
}

export default env;
