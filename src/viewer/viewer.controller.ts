import { Controller, Get, Query } from '@nestjs/common';
import { ViewerService } from './viewer.service';

@Controller('viewer')
export class ViewerController {
  constructor(private viewerService: ViewerService) {}
  @Get('sponsor/by')
  isSponsoredBy(@Query('login') login: string) {
    return this.viewerService.isSponsoredBy(login);
  }

  @Get('sponsor/to')
  isSponsoringTo(@Query('login') login: string) {
    return this.viewerService.isSponsoring(login);
  }

  @Get('sponsor/all')
  async getAllSponsors() {
    return await this.viewerService.getAllSponsors();
  }

  @Get('sponsor/token')
  getSponsor(@Query('token') token: string) {
    return this.viewerService.getSponsorByToken(token);
  }

  @Get('sponsor/login')
  getSponsorByName(@Query('login') login: string) {
    this.viewerService.getSponsor(login);
  }
}
