export interface JwtTokenData {
  username: string;
  userid: string;
}

export interface JwtToken extends JwtTokenData {
  exp: number;
  iat: number;
}

export function parseJwt(token: string): JwtToken | null {
  try {
    const base64Payload = token.split('.')[1];
    const payload = Buffer.from(base64Payload, 'base64');
    return JSON.parse(payload.toString());
  } catch (e) {
    return null;
  }
}

export function parseJwtLegacy(token: string): JwtToken | null {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload.toString());
  } catch (e) {
    return null;
  }
}
