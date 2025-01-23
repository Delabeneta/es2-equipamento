import { Controller, HttpCode, Post } from '@nestjs/common';
import AppService from './app.service';

@Controller()
export default class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/restaurarBanco')
  @HttpCode(200)
  async restoreDatabase() {
    await this.appService.restoreDatabase();
  }
}
