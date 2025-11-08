import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const signupSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const createCompanySchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  logo: z
    .union([z.string().url('URL inválida'), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
});

export const updateCompanySchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  logo: z
    .union([z.string().url('URL inválida'), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
});

export const inviteSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
});

export const acceptInviteSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    name: z.string().optional(),
    password: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.password) return true;
      return data.password.length >= 6;
    },
    {
      message: 'Senha deve ter pelo menos 6 caracteres',
      path: ['password'],
    }
  );

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type CreateCompanyFormData = z.infer<typeof createCompanySchema>;
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>;
export type InviteFormData = z.infer<typeof inviteSchema>;
export type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;

