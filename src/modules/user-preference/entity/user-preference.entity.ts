// user-preference.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UserPreference extends Document {
  @Prop({ required: true, unique: true })
  sessionId: string; 

  @Prop({ type: [String], default: [] })
  cities: string[];
}

export const UserPreferenceSchema = SchemaFactory.createForClass(UserPreference);
