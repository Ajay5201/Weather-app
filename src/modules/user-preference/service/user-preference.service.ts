// weather.service.ts
import { Injectable } from '@nestjs/common';

import { UserPreferenceRepository } from '../repository/user-preference.repository';


@Injectable()
export class UserPreferenceService {

  constructor(
    private readonly userPrefRepo: UserPreferenceRepository,
  ) {}

  // Add city to user preferences
  async addCity(sessionId: string, city: string) {
    return this.userPrefRepo.addCity(sessionId, city);
  }

  // remove city to user preferences
  async removeCity(sessionId: string, city: string) {
    return this.userPrefRepo.removeCity(sessionId, city);
  }

  // Get user cities
  async getUserPreferences(sessionId: string) {
    return this.userPrefRepo.getPreferences(sessionId);
  }


}
