export const useGoogleLogin = () => {
  const handleGoogleLogin = () => {
    // Redirect to backend OAuth2 authorization endpoint
    // Spring Security will handle the OAuth2 flow
    // User-management-service is at port 8001
    const backendOAuthUrl = 'http://localhost:8001/oauth2/authorization/google';
    window.location.href = backendOAuthUrl;
  };

  return {
    handleGoogleLogin,
    isLoading: false, // Google login redirects immediately, no loading state needed
  };
};
