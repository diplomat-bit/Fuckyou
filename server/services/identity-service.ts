import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DatabaseManager } from '../utils/db';
import { logger } from '../utils/logger';

export interface UserProfile {
  id: string;
  email: string;
  role: 'citizen' | 'admin' | 'corporate';
  mfaEnabled: boolean;
  organizationId?: string;
  mfaSecret?: string;
  createdAt?: string;
  updatedAt?: string;
  clearanceLevel?: number;
}

export class IdentityService {
  private db: DatabaseManager;
  private logger: typeof logger;
  private readonly SALT_ROUNDS = 12;
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'super-secret-global-key';

  constructor() {
    this.db = new DatabaseManager();
    this.logger = logger;
  }

  async registerUser(email: string, password: string, role: 'citizen' | 'admin' | 'corporate' = 'citizen', organizationId?: string) {
    this.logger.info(`Registering new user: ${email}`);
    
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
    const userId = uuidv4();

    await this.db.query(
      'INSERT INTO users (id, email, password_hash, role, mfa_enabled, organization_id) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, role, false, organizationId || null]
    );

    return { userId, email, role, organizationId };
  }

  async authenticate(email: string, password: string) {
    const users = await this.db.query<any>('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!users || users.length === 0) {
      throw new Error('Authentication failed: User not found');
    }

    const user = users[0];

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Authentication failed: Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, organizationId: user.organization_id },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      mfaRequired: Boolean(user.mfa_enabled),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id
      }
    };
  }

  async enableMFA(userId: string) {
    const secret = uuidv4();
    await this.db.query('UPDATE users SET mfa_secret = ?, mfa_enabled = ? WHERE id = ?', [secret, true, userId]);
    return { secret };
  }

  async verifyMFA(userId: string, code: string) {
    const users = await this.db.query<any>('SELECT mfa_secret, mfa_enabled FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      throw new Error('User not found');
    }

    const isCodeValid = code && code.length >= 6;
    if (!isCodeValid) {
      throw new Error('Invalid MFA verification code');
    }

    return { verified: true };
  }

  async createOrganization(name: string, ownerId: string) {
    const orgId = uuidv4();
    await this.db.query('INSERT INTO organizations (id, name, owner_id) VALUES (?, ?, ?)', [orgId, name, ownerId]);
    await this.db.query('UPDATE users SET organization_id = ? WHERE id = ?', [orgId, ownerId]);
    return { orgId, name };
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const users = await this.db.query<any>('SELECT id, email, role, mfa_enabled as mfaEnabled, organization_id as organizationId, clearance_level as clearanceLevel FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      throw new Error('User not found');
    }
    return users[0];
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const allowedKeys = ['email', 'role', 'organizationId', 'clearanceLevel'];
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedKeys.includes(key) && value !== undefined) {
        let dbKey = key;
        if (key === 'organizationId') dbKey = 'organization_id';
        if (key === 'clearanceLevel') dbKey = 'clearance_level';
        fieldsToUpdate.push(`${dbKey} = ?`);
        values.push(value);
      }
    }

    if (fieldsToUpdate.length > 0) {
      values.push(userId);
      await this.db.query(`UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`, values);
    }

    return this.getProfile(userId);
  }

  async listUsersByOrganization(organizationId: string): Promise<UserProfile[]> {
    return await this.db.query<UserProfile[]>(
      'SELECT id, email, role, mfa_enabled as mfaEnabled, organization_id as organizationId, clearance_level as clearanceLevel FROM users WHERE organization_id = ?',
      [organizationId]
    );
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async submitKYC(userId: string, data: any) {
    this.logger.info(`Submitting KYC for user: ${userId}`);
    const kycId = uuidv4();
    await this.db.query(
      'INSERT INTO kyc_submissions (id, user_id, status, data) VALUES (?, ?, ?, ?)',
      [kycId, userId, 'pending', JSON.stringify(data)]
    );
    return { kycId, status: 'pending' };
  }

  async updateClearanceLevel(userId: string, level: number) {
    this.logger.info(`Updating clearance level for user: ${userId} to ${level}`);
    await this.db.query('UPDATE users SET clearance_level = ? WHERE id = ?', [level, userId]);
    return { userId, clearanceLevel: level };
  }

  async revokeAllRefreshTokens(userId: string) {
    this.logger.info(`Revoking all refresh tokens for user: ${userId}`);
    await this.db.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
    return { success: true };
  }
}