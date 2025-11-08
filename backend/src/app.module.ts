import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CompanyModule } from './modules/company/company.module';
import { MembershipModule } from './modules/membership/membership.module';
import { InviteModule } from './modules/invite/invite.module';
import { EmailModule } from './modules/email/email.module';
import { appConfig } from './config/app.config';
import { envValidationSchema } from './config/env.validation';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { HealthController } from './common/controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    DatabaseModule,
    AuthModule,
    UserModule,
    CompanyModule,
    MembershipModule,
    EmailModule,
    InviteModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}

