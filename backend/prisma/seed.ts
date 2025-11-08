import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  await prisma.invite.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Senha123!', 10);

  // Cria usuários
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'owner1@example.com',
        name: 'João Silva',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin1@example.com',
        name: 'Maria Santos',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=2',
      },
    }),
    prisma.user.create({
      data: {
        email: 'member1@example.com',
        name: 'Pedro Oliveira',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=3',
      },
    }),
    prisma.user.create({
      data: {
        email: 'owner2@example.com',
        name: 'Ana Costa',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=4',
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin2@example.com',
        name: 'Carlos Mendes',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
    }),
    prisma.user.create({
      data: {
        email: 'member2@example.com',
        name: 'Julia Ferreira',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=6',
      },
    }),
    prisma.user.create({
      data: {
        email: 'owner3@example.com',
        name: 'Roberto Alves',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=7',
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin3@example.com',
        name: 'Fernanda Lima',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=8',
      },
    }),
    prisma.user.create({
      data: {
        email: 'member3@example.com',
        name: 'Lucas Souza',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=9',
      },
    }),
    prisma.user.create({
      data: {
        email: 'member4@example.com',
        name: 'Patricia Rocha',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=10',
      },
    }),
  ]);

  console.log(`✅ Criados ${users.length} usuários`);

  // Cria empresas
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Tech Solutions',
        slug: 'tech-solutions',
        logo: 'https://logo.clearbit.com/google.com',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Digital Innovations',
        slug: 'digital-innovations',
        logo: 'https://logo.clearbit.com/microsoft.com',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Startup Hub',
        slug: 'startup-hub',
        logo: 'https://logo.clearbit.com/apple.com',
      },
    }),
  ]);

  console.log(`✅ Criadas ${companies.length} empresas`);

  // Cria memberships
  // Empresa 1: Tech Solutions
  await prisma.membership.create({
    data: {
      userId: users[0].id,
      companyId: companies[0].id,
      role: Role.OWNER,
    },
  });
  await prisma.membership.create({
    data: {
      userId: users[1].id,
      companyId: companies[0].id,
      role: Role.ADMIN,
    },
  });
  await prisma.membership.create({
    data: {
      userId: users[2].id,
      companyId: companies[0].id,
      role: Role.MEMBER,
    },
  });

  // Empresa 2: Digital Innovations
  await prisma.membership.create({
    data: {
      userId: users[3].id,
      companyId: companies[1].id,
      role: Role.OWNER,
    },
  });
  await prisma.membership.create({
    data: {
      userId: users[4].id,
      companyId: companies[1].id,
      role: Role.ADMIN,
    },
  });
  await prisma.membership.create({
    data: {
      userId: users[5].id,
      companyId: companies[1].id,
      role: Role.MEMBER,
    },
  });
  await prisma.membership.create({
    data: {
      userId: users[6].id,
      companyId: companies[1].id,
      role: Role.MEMBER,
    },
  });

  // Empresa 3: Startup Hub
  await prisma.membership.create({
    data: {
      userId: users[6].id,
      companyId: companies[2].id,
      role: Role.OWNER,
    },
  });
  await prisma.membership.create({
    data: {
      userId: users[7].id,
      companyId: companies[2].id,
      role: Role.ADMIN,
    },
  });
  await prisma.membership.create({
    data: {
      userId: users[8].id,
      companyId: companies[2].id,
      role: Role.MEMBER,
    },
  });
  await prisma.membership.create({
    data: {
      userId: users[9].id,
      companyId: companies[2].id,
      role: Role.MEMBER,
    },
  });

  console.log('✅ Criados memberships');

  // Define empresas ativas
  await prisma.user.update({
    where: { id: users[0].id },
    data: { activeCompanyId: companies[0].id },
  });
  await prisma.user.update({
    where: { id: users[3].id },
    data: { activeCompanyId: companies[1].id },
  });
  await prisma.user.update({
    where: { id: users[6].id },
    data: { activeCompanyId: companies[2].id },
  });

  console.log('✅ Empresas ativas definidas');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📧 Credenciais de teste:');
  console.log('   Email: owner1@example.com | Senha: Senha123!');
  console.log('   Email: admin1@example.com | Senha: Senha123!');
  console.log('   Email: member1@example.com | Senha: Senha123!');
  console.log('\n💡 Nota: Todos os usuários usam a mesma senha para facilitar testes.');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

