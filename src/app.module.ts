import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { RedisModule } from './modules/redis/redis.module';
import { UserPreferenceModule } from './modules/user-preference/user-preference.module';
import { WeatherModule } from './modules/weather/weather.module';
import { CityLookModule } from './modules/city-lookup/city-lookup.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    HealthModule,
    RedisModule,
    UserPreferenceModule,
    WeatherModule,
    CityLookModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
