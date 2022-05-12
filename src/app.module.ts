import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViewerModule } from './viewer/viewer.module';

@Module({
  imports: [ViewerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
