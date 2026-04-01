import { OAuth2Client } from "google-auth-library";

const googleClientId = process.env.GOOGLE_CLIENT_ID;

if (!googleClientId) {
  throw new Error("GOOGLE_CLIENT_ID is not defined in your .env file");
}

const client = new OAuth2Client(googleClientId);

export const verifyGoogleToken = async (credential: string) => {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub || !payload.email || !payload.name) {
    throw new Error("Invalid Google token");
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture ?? "",
  };
};
