import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserPreference } from '../entity/user-preference.entity';


@Injectable()
export class UserPreferenceRepository {
  constructor(
    @InjectModel(UserPreference.name)
    private userPrefModel: Model<UserPreference>,
  ) {}

  // Create or update user preferences
  async CreateUserOrAddCityIfUserExist(sessionId: string, city: string): Promise<UserPreference> {
    return this.userPrefModel.findOneAndUpdate(
      { sessionId },
      { $addToSet: { cities: city.toLocaleLowerCase() } }, 
      { new: true, upsert: true },
    );
  }


   // remove  user preferences
   async removeCity(sessionId: string, city: string): Promise<UserPreference> {
    const pref = await this.userPrefModel.findOne({ sessionId });
  
    if (!pref) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }
  
    if (!pref.cities.includes(city )) {
      throw new NotFoundException(`City "${city}" not found in preferences`);
    }
  
    const updated = await this.userPrefModel.findOneAndUpdate(
      { sessionId },
      { $pull: { cities: city } },
      { new: true },
    );
  
    if (!updated) {
      throw new NotFoundException(`Failed to update preferences for session ${sessionId}`);
    }
  
    return updated; 
  }

  // Get user preferences
  async getPreferences(sessionId: string): Promise<UserPreference | null> {
    return this.userPrefModel.findOne({ sessionId }).exec();
  }
}
