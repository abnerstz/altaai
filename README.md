# Altaa.ai - Plataforma Multi-tenant

Plataforma multi-tenant completa para gerenciamento de empresas, membros e convites. Projeto composto por backend (NestJS) e frontend (React) com arquitetura moderna e escalável.

## 🌐 Links

- **Frontend em Produção**: [https://altaai-frontend.vercel.app](https://altaai-frontend.vercel.app)
- **Backend API**: [https://altaai-backend.fly.dev](https://altaai-backend.fly.dev)
- **Documentação Swagger**: [https://altaai-backend.fly.dev/api](https://altaai-backend.fly.dev/api)

## 📋 Índice

- [Visão Geral do Projeto](#visão-geral-do-projeto)
- [Estrutura do Repositório](#estrutura-do-repositório)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Backend](#backend)
  - [Arquitetura](#arquitetura-backend)
  - [Instalação e Execução](#instalação-e-execução-backend)
  - [Configuração](#configuração-backend)
  - [API Endpoints](#api-endpoints)
- [Frontend](#frontend)
  - [Arquitetura](#arquitetura-frontend)
  - [Instalação e Execução](#instalação-e-execução-frontend)
  - [Configuração](#configuração-frontend)
- [Padrões e Boas Práticas](#padrões-e-boas-práticas)
- [Deploy](#deploy)
- [Escolhas Técnicas](#escolhas-técnicas)

## 🎯 Visão Geral do Projeto

A Altaa.ai é uma plataforma multi-tenant que permite:

- **Autenticação Completa**: Sistema de login, registro e gerenciamento de sessão
- **Multi-tenancy**: Isolamento completo de dados por empresa
- **Gerenciamento de Empresas**: Criação e administração de empresas (tenants)
- **Sistema de Convites**: Convites para adicionar membros às empresas
- **Controle de Acesso**: Sistema de roles (OWNER, ADMIN, MEMBER)
- **Interface Moderna**: UI responsiva e intuitiva

## 📁 Estrutura do Repositório

```
altaai/
├── backend/              # API NestJS
│   ├── src/             # Código fonte
│   ├── prisma/          # Schema e migrações
│   ├── dist/            # Build de produção
│   └── package.json
├── frontend/            # Aplicação React
│   ├── src/            # Código fonte
│   ├── dist/           # Build de produção
│   └── package.json
└── README.md           # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **NestJS 10.3.0**: Framework Node.js
- **TypeScript 5.3.3**: Tipagem estática
- **Prisma 5.7.1**: ORM type-safe
- **PostgreSQL**: Banco de dados
- **JWT**: Autenticação
- **Swagger**: Documentação da API

### Frontend
- **React 18.2.0**: Biblioteca UI
- **TypeScript 5.3.3**: Tipagem estática
- **Vite 5.0.8**: Build tool
- **Tailwind CSS 3.4.0**: Estilização
- **Zustand**: Gerenciamento de estado
- **TanStack Query**: Cache e sincronização de dados
- **React Hook Form + Zod**: Formulários e validação

## 🔧 Backend

### Arquitetura Backend

O backend segue os princípios de **Clean Architecture** e **SOLID**:

```
backend/
├── src/
│   ├── main.ts                 # Bootstrap da aplicação
│   ├── app.module.ts          # Módulo raiz
│   ├── config/                # Configurações e validação de env
│   ├── database/              # Configuração do Prisma
│   ├── common/                # Recursos compartilhados
│   │   ├── controllers/       # Controllers comuns (health)
│   │   ├── decorators/        # Decorators customizados
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # Guards de autenticação/autorização
│   │   └── middleware/        # Middlewares (tenant)
│   └── modules/               # Módulos de negócio
│       ├── auth/              # Autenticação
│       ├── user/              # Usuários
│       ├── company/           # Empresas (tenants)
│       ├── membership/        # Membros de empresas
│       ├── invite/            # Sistema de convites
│       └── email/             # Serviço de email
└── prisma/
    └── schema.prisma          # Schema do banco de dados
```

### Instalação e Execução Backend

#### Pré-requisitos
- Node.js 20+
- Yarn ou npm
- PostgreSQL 14+
- Docker (opcional)

#### Passos

1. **Entre na pasta do backend**
```bash
cd backend
```

2. **Instale as dependências**
```bash
yarn install
```

3. **Configure o banco de dados**

Crie um arquivo `.env` na pasta `backend/`:
```env
# Ambiente
NODE_ENV=development

# Servidor
PORT=3000

# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/altaai

# JWT
JWT_SECRET=seu-secret-super-seguro-com-pelo-menos-32-caracteres
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:5173,https://altaai-frontend.vercel.app

# Email (Opcional)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@altaai.com
```

4. **Execute as migrações**
```bash
yarn prisma:migrate
```

5. **Gere o Prisma Client**
```bash
yarn prisma:generate
```

6. **Execute o seed (opcional)**
```bash
yarn prisma:seed
```

7. **Inicie o servidor**
```bash
yarn start:dev
```

O servidor estará disponível em `http://localhost:3000`  
Documentação Swagger: `http://localhost:3000/api`

### Configuração Backend

#### Variáveis de Ambiente Obrigatórias

- `DATABASE_URL`: URL de conexão com PostgreSQL
- `JWT_SECRET`: Secret para assinatura de tokens (mínimo 32 caracteres)
- `FRONTEND_URL`: URLs permitidas para CORS (separadas por vírgula)

#### Variáveis Opcionais

- `PORT`: Porta do servidor (padrão: 3000)
- `JWT_EXPIRES_IN`: Tempo de expiração do token (padrão: 7d)
- `RESEND_API_KEY`: Chave da API Resend para envio de emails
- `EMAIL_FROM`: Email remetente
- `COOKIE_SECRET`: Secret para cookies

### API Endpoints

#### Autenticação (`/auth`)
- `POST /auth/signup` - Registro de novo usuário
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Obter usuário autenticado
- `POST /auth/accept-invite` - Aceitar convite

#### Empresas (`/companies`)
- `GET /companies` - Listar empresas do usuário
- `POST /companies` - Criar nova empresa
- `GET /companies/:id` - Obter detalhes da empresa
- `PATCH /companies/:id` - Atualizar empresa
- `POST /companies/:id/select` - Selecionar empresa ativa

#### Membros (`/memberships`)
- `GET /memberships` - Listar membros da empresa ativa
- `PATCH /memberships/:id` - Atualizar role do membro

#### Convites (`/invites`)
- `POST /invites` - Criar convite
- `GET /invites` - Listar convites da empresa ativa

#### Health Check
- `GET /health` - Status da aplicação

**Documentação completa**: [https://altaai-backend.fly.dev/api](https://altaai-backend.fly.dev/api)

### Scripts Backend

```bash
# Desenvolvimento
yarn start:dev          # Inicia com hot-reload
yarn start:debug        # Inicia em modo debug

# Produção
yarn build              # Compila o projeto
yarn start:prod         # Inicia versão compilada

# Qualidade de Código
yarn lint               # Executa ESLint
yarn format             # Formata código com Prettier

# Testes
yarn test               # Executa testes unitários
yarn test:watch         # Executa testes em modo watch
yarn test:cov           # Executa testes com cobertura
yarn test:e2e           # Executa testes end-to-end

# Prisma
yarn prisma:generate    # Gera Prisma Client
yarn prisma:migrate     # Executa migrações
yarn prisma:seed        # Executa seed do banco
```

## 🎨 Frontend

### Arquitetura Frontend

O frontend segue uma arquitetura modular:

```
frontend/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Componente raiz e rotas
│   ├── components/           # Componentes React
│   │   ├── ui/              # Componentes base (shadcn/ui)
│   │   ├── layout/          # Componentes de layout
│   │   ├── company/         # Componentes de empresas
│   │   ├── invite/          # Componentes de convites
│   │   └── user/            # Componentes de usuário
│   ├── pages/                # Páginas da aplicação
│   │   ├── auth/            # Páginas de autenticação
│   │   ├── dashboard/       # Dashboard
│   │   ├── company/         # Páginas de empresas
│   │   └── invite/          # Páginas de convites
│   ├── routes/               # Proteção de rotas
│   ├── services/             # Serviços de API
│   ├── hooks/                # Custom hooks
│   ├── store/                # Gerenciamento de estado
│   ├── lib/                  # Utilitários
│   └── types/                # Definições de tipos
└── dist/                     # Build de produção
```

### Instalação e Execução Frontend

#### Pré-requisitos
- Node.js 20+
- Yarn ou npm
- Backend rodando (ou URL da API configurada)

#### Passos

1. **Entre na pasta do frontend**
```bash
cd frontend
```

2. **Instale as dependências**
```bash
yarn install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na pasta `frontend/`:
```env
VITE_API_URL=http://localhost:3000
```

4. **Inicie o servidor de desenvolvimento**
```bash
yarn dev
```

A aplicação estará disponível em `http://localhost:5173`

### Configuração Frontend

#### Variáveis de Ambiente

- `VITE_API_URL`: URL da API backend (padrão: `http://localhost:3000`)

Para produção, configure no Vercel:
- `VITE_API_URL=https://altaai-backend.fly.dev`

### Scripts Frontend

```bash
# Desenvolvimento
yarn dev              # Inicia servidor de desenvolvimento
yarn preview          # Preview da build de produção

# Build
yarn build            # Cria build de produção

# Qualidade de Código
yarn lint             # Executa ESLint
yarn format           # Formata código com Prettier
yarn type-check       # Verifica tipos TypeScript

# Testes
yarn test             # Executa testes
yarn test:watch       # Executa testes em modo watch
yarn test:ui          # Abre interface de testes
yarn test:coverage    # Executa testes com cobertura
```

## 📐 Padrões e Boas Práticas

### Backend

- **Clean Architecture**: Separação clara de camadas
- **SOLID**: Princípios aplicados em toda a base de código
- **Dependency Injection**: Via construtor do NestJS
- **Validação**: DTOs com class-validator
- **Tratamento de Erros**: Centralizado via Exception Filters
- **Multi-tenancy**: Isolamento por empresa via middleware

### Frontend

- **Componentes Funcionais**: Todos os componentes são funções
- **TypeScript**: Tipagem completa
- **Separação de Responsabilidades**: Lógica em hooks, apresentação em componentes
- **Validação**: Zod schemas + React Hook Form
- **Estado Global**: Zustand para autenticação, TanStack Query para dados do servidor
- **Code Splitting**: Lazy loading de rotas

### Convenções

- **Nomenclatura**: 
  - Componentes: PascalCase
  - Hooks: camelCase com prefixo `use`
  - Services: camelCase com sufixo `.service.ts`
  - Controllers: camelCase com sufixo `.controller.ts`

- **Estrutura**: Cada módulo/feature em sua própria pasta
- **Testes**: Arquivos `*.test.ts` ou `*.spec.ts`
- **Documentação**: Código auto-documentado com TypeScript

## 🚢 Deploy

### Backend (Fly.io)

1. Configure `fly.toml` com suas configurações
2. Execute `fly deploy`
3. Configure variáveis de ambiente no Fly.io dashboard

### Frontend (Vercel)

1. Conecte o repositório ao Vercel
2. Configure variáveis de ambiente:
   - `VITE_API_URL=https://altaai-backend.fly.dev`
3. Deploy automático a cada push

### Docker (Backend)

```bash
cd backend
docker build -t altaai-backend .
docker run -p 3000:3000 --env-file .env altaai-backend
```

## 🎓 Escolhas Técnicas

### Por que NestJS?

- Arquitetura modular e escalável
- TypeScript nativo
- Dependency Injection robusta
- Ecosystem maduro e completo
- Decorators para código limpo

### Por que Prisma?

- Type safety automático
- Migrations e seed integrados
- Developer experience excelente
- Performance otimizada
- Suporte multi-database

### Por que React + Vite?

- Ecosystem maior e mais maduro
- Build extremamente rápido
- HMR instantâneo
- Code splitting automático
- TypeScript first-class

### Por que Zustand + TanStack Query?

- Zustand: Simples, leve, sem boilerplate
- TanStack Query: Cache automático, sincronização, optimistic updates
- Separação clara: Estado global vs estado do servidor

### Por que JWT em Cookies?

- Segurança: httpOnly não acessível via JS
- Cross-origin: Suporte a `sameSite: 'none'`
- Automático: Enviado pelo browser
- CSRF: Tokens JWT reduzem risco

### Por que Multi-tenancy por Company?

- Isolamento completo de dados
- Escalabilidade fácil
- Flexibilidade: usuários em múltiplas empresas
- Simplicidade: Implementação direta

## 📝 Licença

UNLICENSED - Uso interno


