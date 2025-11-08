import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configura o servidor MSW para Node.js (usado em testes)
export const server = setupServer(...handlers);

