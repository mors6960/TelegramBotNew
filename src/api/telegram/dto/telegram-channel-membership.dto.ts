import { IsString } from 'class-validator';

export class TelegramChannelMembershipDto {
  @IsString()
  telegramId: string;
}
