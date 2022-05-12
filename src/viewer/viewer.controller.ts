import { Controller, Get, Query } from '@nestjs/common';
import { ViewerService } from './viewer.service';

@Controller('viewer')
export class ViewerController {
  constructor(private viewerService: ViewerService) {}
  @Get('sponsored/by')
  isSponsoredBy(@Query('loginName') loginName: string) {
    return this.viewerService.isSponsoredBy(loginName);
  }
  @Get('sponsors/to')
  isSponsoringTo(@Query('loginName') loginName: string) {
    return this.viewerService.isSponsoring(loginName);
  }

  @Get('sponsors/all')
  async getAllSponsors() {
    return await this.viewerService.getAllSponsors();
  }

  @Get('sponsor/current')
  getSponsor(@Query('token') token: string) {
    return this.viewerService.getSponsorByToken(token);
  }
}
