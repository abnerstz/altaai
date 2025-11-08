import { describe, it, expect } from 'vitest';
import { cn, getDefaultAvatar, getUserInitials, isValidImageUrl } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('deve combinar classes CSS corretamente', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('deve mesclar classes Tailwind conflitantes', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });

    it('deve lidar com valores condicionais', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('deve lidar com arrays e objetos', () => {
      expect(cn(['foo', 'bar'], { baz: true, qux: false })).toBe('foo bar baz');
    });
  });

  describe('getDefaultAvatar', () => {
    it('deve gerar URL de avatar com nome', () => {
      const url = getDefaultAvatar('John Doe');
      expect(url).toContain('api.dicebear.com');
      expect(url).toContain('seed=John%20Doe');
    });

    it('deve gerar URL de avatar com email', () => {
      const url = getDefaultAvatar(undefined, 'test@example.com');
      expect(url).toContain('seed=test%40example.com');
    });

    it('deve usar "user" como fallback', () => {
      const url = getDefaultAvatar();
      expect(url).toContain('seed=user');
    });
  });

  describe('getUserInitials', () => {
    it('deve extrair iniciais de nome completo', () => {
      expect(getUserInitials('John Doe')).toBe('JD');
    });

    it('deve extrair iniciais de nome com múltiplas palavras', () => {
      expect(getUserInitials('John Michael Doe')).toBe('JM');
    });

    it('deve retornar "U" quando nome não fornecido', () => {
      expect(getUserInitials()).toBe('U');
      expect(getUserInitials('')).toBe('U');
    });

    it('deve converter para maiúsculas', () => {
      expect(getUserInitials('john doe')).toBe('JD');
    });

    it('deve limitar a 2 caracteres', () => {
      expect(getUserInitials('John Michael Doe Smith')).toBe('JM');
    });
  });

  describe('isValidImageUrl', () => {
    it('deve validar URL HTTP válida', () => {
      expect(isValidImageUrl('http://example.com/image.jpg')).toBe(true);
    });

    it('deve validar URL HTTPS válida', () => {
      expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true);
    });

    it('deve rejeitar URL inválida', () => {
      expect(isValidImageUrl('not-a-url')).toBe(false);
      expect(isValidImageUrl('ftp://example.com/image.jpg')).toBe(false);
    });

    it('deve rejeitar string vazia', () => {
      expect(isValidImageUrl('')).toBe(false);
    });
  });
});

