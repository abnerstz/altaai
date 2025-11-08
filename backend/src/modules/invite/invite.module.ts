import { Module } from '@nestjs/common';
import { InviteController, InviteDeleteController, PublicInviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [InviteController, InviteDeleteController, PublicInviteController],
  providers: [InviteService],
  exports: [InviteService],
})
export class InviteModule {}

