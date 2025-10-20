import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'yyd-customer-secret-change-in-production';
const JWT_EXPIRES_IN = '30d'; // Customers stay logged in longer

export interface CustomerJWTPayload {
  customerId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateCustomerToken(payload: CustomerJWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyCustomerToken(token: string): CustomerJWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as CustomerJWTPayload;
  } catch (error) {
    return null;
  }
}

export function getCustomerFromRequest(request: Request): CustomerJWTPayload | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyCustomerToken(token);
  }

  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/customer-token=([^;]+)/);
    if (match) {
      return verifyCustomerToken(match[1]);
    }
  }

  return null;
}

export function requireCustomerAuth(request: Request): CustomerJWTPayload {
  const customer = getCustomerFromRequest(request);

  if (!customer) {
    throw new Error('Unauthorized');
  }

  return customer;
}
