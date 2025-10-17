import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-super-securise-changez-moi';

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Hache un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Vérifie un mot de passe
 * Gère la compatibilité Laravel ($2y$) et Node.js ($2a$)
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Laravel utilise $2y$, bcryptjs utilise $2a$
  // Ils sont compatibles, mais on convertit pour être sûr
  const convertedHash = hashedPassword.replace(/^\$2y\$/, '$2a$');
  return bcrypt.compare(password, convertedHash);
}

/**
 * Génère un token JWT
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Vérifie et décode un token JWT
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extrait le token du header Authorization
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

