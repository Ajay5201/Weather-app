// user-preference.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ 
  timestamps: true,
  collection: 'user_preferences'
})
export class UserPreference extends Document {
  @Prop({ 
    required: true, 
    unique: true,
    index: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  })
  sessionId: string; 

  @Prop({ 
    type: [String], 
    default: [],
    validate: {
      validator: function(cities: string[]) {
        return cities.every(city => 
          typeof city === 'string' && 
          city.length >= 1 && 
          city.length <= 100
        );
      },
      message: 'Each city must be a string between 1 and 100 characters'
    }
  })
  cities: string[];
}

export const UserPreferenceSchema = SchemaFactory.createForClass(UserPreference);

// Add compound index for efficient queries
UserPreferenceSchema.index({ sessionId: 1, cities: 1 });

// Add text index for city search (if needed in future)
// UserPreferenceSchema.index({ cities: 'text' });
