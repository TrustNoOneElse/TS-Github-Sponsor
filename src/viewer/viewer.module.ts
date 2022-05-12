import { Module } from '@nestjs/common';
import { ViewerService } from './viewer.service';
import { ViewerController } from './viewer.controller';
import { QueryService } from 'src/query/query.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [ViewerService, QueryService],
  controllers: [ViewerController],
  imports: [HttpModule],
})
export class ViewerModule {}
