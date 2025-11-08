import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  signupSchema,
  createCompanySchema,
  updateCompanySchema,
  inviteSchema,
  acceptInviteSchema,
} from '../schemas';

describe('schemas', () => {
  describe('loginSchema', () => {
    it('deve validar dados de login corretos', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find((issue) => issue.path[0] === 'email');
        expect(emailError).toBeDefined();
        expect(emailError?.path).toEqual(['email']);
      }
    });

    it('deve rejeitar senha vazia', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find((issue) => issue.path[0] === 'password');
        expect(passwordError).toBeDefined();
        expect(passwordError?.path).toEqual(['password']);
      }
    });
  });

  describe('signupSchema', () => {
    it('deve validar dados de signup corretos', () => {
      const result = signupSchema.safeParse({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('deve rejeitar nome muito curto', () => {
      const result = signupSchema.safeParse({
        name: 'Jo',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find((issue) => issue.path[0] === 'name');
        expect(nameError).toBeDefined();
        expect(nameError?.path).toEqual(['name']);
      }
    });

    it('deve rejeitar senha muito curta', () => {
      const result = signupSchema.safeParse({
        name: 'John Doe',
        email: 'test@example.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find((issue) => issue.path[0] === 'password');
        expect(passwordError).toBeDefined();
        expect(passwordError?.path).toEqual(['password']);
      }
    });
  });

  describe('createCompanySchema', () => {
    it('deve validar dados de criação de empresa corretos', () => {
      const result = createCompanySchema.safeParse({
        name: 'My Company',
      });
      expect(result.success).toBe(true);
    });

    it('deve validar com logo opcional', () => {
      const result = createCompanySchema.safeParse({
        name: 'My Company',
        logo: 'https://example.com/logo.png',
      });
      expect(result.success).toBe(true);
    });

    it('deve transformar string vazia em undefined para logo', () => {
      const result = createCompanySchema.safeParse({
        name: 'My Company',
        logo: '',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.logo).toBeUndefined();
      }
    });

    it('deve rejeitar nome muito curto', () => {
      const result = createCompanySchema.safeParse({
        name: 'AB',
      });
      expect(result.success).toBe(false);
    });

    it('deve rejeitar URL inválida para logo', () => {
      const result = createCompanySchema.safeParse({
        name: 'My Company',
        logo: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateCompanySchema', () => {
    it('deve validar atualização com apenas nome', () => {
      const result = updateCompanySchema.safeParse({
        name: 'Updated Company',
      });
      expect(result.success).toBe(true);
    });

    it('deve validar atualização com apenas logo', () => {
      const result = updateCompanySchema.safeParse({
        logo: 'https://example.com/logo.png',
      });
      expect(result.success).toBe(true);
    });

    it('deve validar atualização vazia', () => {
      const result = updateCompanySchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('inviteSchema', () => {
    it('deve validar dados de convite corretos', () => {
      const result = inviteSchema.safeParse({
        email: 'test@example.com',
        role: 'MEMBER',
      });
      expect(result.success).toBe(true);
    });

    it('deve validar todos os roles', () => {
      const roles = ['OWNER', 'ADMIN', 'MEMBER'] as const;
      roles.forEach((role) => {
        const result = inviteSchema.safeParse({
          email: 'test@example.com',
          role,
        });
        expect(result.success).toBe(true);
      });
    });

    it('deve rejeitar role inválido', () => {
      const result = inviteSchema.safeParse({
        email: 'test@example.com',
        role: 'INVALID',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('acceptInviteSchema', () => {
    it('deve validar aceitação de convite apenas com token', () => {
      const result = acceptInviteSchema.safeParse({
        token: 'valid-token',
      });
      expect(result.success).toBe(true);
    });

    it('deve validar aceitação com nome e senha', () => {
      const result = acceptInviteSchema.safeParse({
        token: 'valid-token',
        name: 'John Doe',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('deve rejeitar senha muito curta', () => {
      const result = acceptInviteSchema.safeParse({
        token: 'valid-token',
        password: '12345',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find((issue) => issue.path[0] === 'password');
        expect(passwordError).toBeDefined();
        expect(passwordError?.path).toEqual(['password']);
      }
    });

    it('deve rejeitar token vazio', () => {
      const result = acceptInviteSchema.safeParse({
        token: '',
      });
      expect(result.success).toBe(false);
    });
  });
});

