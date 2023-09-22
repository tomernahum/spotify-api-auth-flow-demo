
//not sure clientId is secret, I think not, I guess what stops people from impersonating me is the redirectURL

export const clientId = import.meta.env.VITE_CLIENT_ID ||;  
export const redirectUri = import.meta.env.VITE_REDIRECT_URI;

if (!clientId) {
    throw new Error("env.VITE_CLIENT_ID not defined");
}
if (!redirectUri) {
    throw new Error("env.VITE_REDIRECT_URI not defined");
}