import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gera URL de avatar padrão usando DiceBear API
 */
export function getDefaultAvatar(name?: string, email?: string): string {
  const seed = name || email || 'user';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

/**
 * Extrai iniciais do nome do usuário
 */
export function getUserInitials(name?: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Valida se uma URL é válida e segura para uso em imagens
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
