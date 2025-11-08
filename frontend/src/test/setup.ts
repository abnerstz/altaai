import { afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';

// Limpa o DOM após cada teste
afterEach(() => {
  cleanup();
});

// Inicia o servidor MSW antes de todos os testes
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reseta handlers após cada teste
afterEach(() => {
  server.resetHandlers();
});

// Fecha o servidor MSW após todos os testes
afterAll(() => {
  server.close();
});

