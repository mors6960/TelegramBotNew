import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import { callApi, decryptData, encryptData } from '../../common/util/Utility';
import { ConfigService } from '@nestjs/config';
import {
  failResponse,
  returnError,
  returnSuccess,
  successResponse,
} from 'src/common/util/response.handler';
const PROJECT_NAME_ENCRYPTION_KEY = process.env.PROJECT_NAME_ENCRYPTION_KEY;
const encryption_key = `${PROJECT_NAME_ENCRYPTION_KEY}`;
@Injectable()
export class BotService {
  private bot: TelegramBot;

  constructor() {
    dotenv.config(); // Load environment variables from .env file
    const token = process.env.TELEGRAM_TOKEN;
    this.bot = new TelegramBot(token, { polling: true });
    this.initListeners();
  }

  private initListeners() {
    // Handle /start command
    this.bot.onText(/\/start/, async (msg, match) => {
      const chatId = msg.chat.id;
      const username = msg.from?.username;
      const firstName = msg.from?.first_name;
      const args = match?.input.split(' ')[1]; // Extract referral code from command arguments

      const welcomeText = `Hi ${firstName}`;
      const body = this.prepareRequestBody(
        firstName,
        msg.from?.id,
        username,
        args,
      );
      const encryptedData = await this.encryptRequestData(body);
      try {
        // const data = await callApi(process.env.SIGN_UP_URL, "POST", body, header);
        // console.log('%csrc/api/telegram/bot.service.ts:49 data', 'color: #007acc;', data);
        // Define the title, description, and button
        // const title = "Welcome to Shido Ninja!";
        const timestamp = new Date().toISOString();
        const title = `Welcome to Shido Ninja. \nThis is your unique session: ${timestamp}`;

        const description =
          'Dive into an exciting journey where each tap brings you closer to earning in-game coins and Shido tokens! \nProgress through challenging levels and watch your earnings grow. \nUp for the challenge? Begin tapping and unleashing your inner Shido Ninja!';
        const webAppUrl = process.env.WEB_APP_URL + msg.from?.id;
        // const webAppUrl = process.env.WEB_APP_URL;
        console.log(
          '%csrc/api/telegram/bot.service.ts:54 webAppUrl',
          'color: #007acc;',
          webAppUrl,
        );
        const messageOptions = {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Play Game', web_app: { url: webAppUrl } }],
            ],
          },
        };

        // Send the welcome message with the button
        // this.bot.sendMessage(chatId, `${welcomeText}\n\n${title}\n${description}`, messageOptions);
        // this.bot.sendMessage(chatId, `${title}\n${description}`, messageOptions);
        // const responseData = await callApi(
        //   process.env.SIGN_UP_URL,
        //   'POST',
        //   encryptedData,
        // );
        // const data = this.decryptResponseData(responseData);
        this.sendWelcomeMessage(chatId, welcomeText, msg.from?.id);
      } catch (error) {
        console.error('Error in Bot:', error);
      }
    });
  }

  private prepareRequestBody(
    firstName: string,
    telegramId: number | undefined,
    username: string | undefined,
    referralCode: string | undefined,
  ): object {
    return {
      name: firstName,
      telegramId: telegramId,
      userName: username ?? firstName,
      referralCode: referralCode,
    };
  }

  async encryptRequestData(data: object): Promise<any> {
    const isEncryptionEnabled = process.env.ENCRYPTION === 'true';
    if (isEncryptionEnabled) {
      const dataString = JSON.stringify(data);
      const reqDataResp = await encryptData(dataString);
      return { reqData: reqDataResp };
    }
    return data;
  }

  async getKey(value: number) {
    const key = encryption_key;
    // get the prime number
    const primeNumbers: any = await this.getPrimeNumbersInRange(1, value);
    // get the string according to the prime number
    const string = primeNumbers.map((number: number) => key[number]).join('');
    return string;
  }

  async getPrimeNumbersInRange(start: number, end: number) {
    const primeNumbers = [];

    for (let number = start; number <= end; number++) {
      if (await this.isPrime(number)) {
        primeNumbers.push(number);
      }
    }
    return primeNumbers;
  }

  async isPrime(number: number) {
    if (number <= 1) {
      return false;
    }
    if (number <= 3) {
      return true;
    }
    if (number % 2 === 0 || number % 3 === 0) {
      return false;
    }
    for (let i = 5; i * i <= number; i += 6) {
      if (number % i === 0 || number % (i + 2) === 0) {
        return false;
      }
    }
    return true;
  }
  private decryptResponseData(data: any): any {
    // const isEncryptionEnabled = process.env.ENCRYPTION === 'true';
    // if (isEncryptionEnabled) {
    //   return decryptData(data);
    // }
    return data;
  }

  private async sendWelcomeMessage(
    chatId: number,
    welcomeText: string,
    userId: number | undefined,
  ) {
    // const playGame = await this.redis.get(`${chatId}_${userId}`);
    // console.log('playGame=============', playGame);

    // Check if the playGame value exists in the cache
    // if (!playGame) {
    // await this.redis.set(`${chatId}_${userId}`, `true`, 86400);
    const title = 'Welcome to Shido Ninja!';
    const description =
      'Dive into an exciting journey where each tap brings you closer to earning in-game coins and Shido tokens! \nProgress through challenging levels and watch your earnings grow. \nUp for the challenge? Begin tapping and unleashing your inner Shido Ninja!';
    const webAppUrl = `${process.env.WEB_APP_URL}${userId}&chatId=${chatId}`;
    const messageOptions = {
      reply_markup: {
        inline_keyboard: [[{ text: 'Play Game', web_app: { url: webAppUrl } }]],
      },
    };
    this.bot.sendMessage(
      chatId,
      `${welcomeText}\n\n${title}\n${description}`,
      messageOptions,
    );
    // } else {
    //   // Handle the case where the user has already played
    //   this.bot.sendMessage(chatId, "You've already started the game!"); // Example message
    // }
  }

  public async checkTelegramMembership(telegramId: string): Promise<any> {
    try {
      const api = `${process.env.TELEGRAM_API_BASE_URL}bot${process.env.TELEGRAM_TOKEN}/getChatMember`;
      const params = {
        chat_id: process.env.TELEGRAM_MEMBERSHIP_CHANNEL_USERNAME,
        user_id: telegramId,
      };
      const response = await callApi(api, 'GET', null, null, params);
      if (response.ok) {
        const status = response.result.status;
        if (
          status === 'member' ||
          status === 'administrator' ||
          status === 'creator'
        ) {
          return returnSuccess(
            false,
            'You are successfully joined as a member of the channel.',
            { isMember: true },
          );
        }
      }
      return returnError(
        true,
        'It looks like you are not a member of the channel yet.',
      );
    } catch (error) {
      console.error('Error checking membership:', error);
      return returnError(true, 'An error occurred while checking membership');
    }
  }
}
