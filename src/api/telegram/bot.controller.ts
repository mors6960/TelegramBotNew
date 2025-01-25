import { Controller, Get, Response, Param } from '@nestjs/common';
import { BotService } from './bot.service';
import { TelegramChannelMembershipDto } from './dto/telegram-channel-membership.dto';
import {
  failResponse,
  failResponse1,
  successResponse,
  successResponse1,
} from 'src/common/util/response.handler';

@Controller('telegram')
export class BotController {
  constructor(private botService: BotService) {}

  @Get('check-membership/:telegramId')
  async checkTelegramMembership(
    @Param() { telegramId }: TelegramChannelMembershipDto,
    @Response() response: any,
  ) {
    try {
      const resp: any =
        await this.botService.checkTelegramMembership(telegramId);
      if (resp?.error) throw resp;
      return successResponse(resp?.message, resp?.data, response);
    } catch (error) {
      return failResponse(true, error?.message, response);
    }
  }
}
