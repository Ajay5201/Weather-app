import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserPreferenceService } from './service/user-preference.service';
import { UserPreferenceController } from './controller/user-preference.controller';
import { UserPreferenceRepository } from './repository/user-preference.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserPreference, UserPreferenceSchema } from './entity/user-preference.entity';


@Module({
  imports: [HttpModule, MongooseModule.forFeature([{ name: UserPreference.name, schema: UserPreferenceSchema }])],   // ✅ Required
  controllers: [UserPreferenceController],
  providers: [UserPreferenceService,UserPreferenceRepository],
  exports:[UserPreferenceService]
})
export class UserPreferenceModule {}
