import 'reflect-metadata'
import 'dotenv/config'
import { words } from '../constants/words'
import { Word } from '../config/db/entity'
import { AppDataSource } from '../config/db/data-source'

async function seeder() {
  try {
    await AppDataSource.initialize()
    
    const wordRepository = AppDataSource.getRepository(Word)
    
    const wordEntities = wordRepository.create(words)
    await wordRepository.save(wordEntities)
    
    console.log('New Documents Inserted')
    
  } catch(error) {
    console.log(error)
  } finally {
    await AppDataSource.destroy()
  }
}

seeder()