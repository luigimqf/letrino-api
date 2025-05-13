import mongoose from 'mongoose';
import 'dotenv/config'
import { Word } from '../config/db/models/word';
import { words } from '../constants/words';

async function seeder() {
  try {
    await mongoose.connect(process.env.MONGODB_URI ?? '')
    
    await Word.insertMany(words);
    
    console.log('New Documents Inserted')
    return;
    
  } catch(error) {
    console.log(error)
  } finally {
    await mongoose.disconnect()
  }
}

seeder()