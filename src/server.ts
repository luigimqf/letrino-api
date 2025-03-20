import 'dotenv/config'
import setupApp from './config/app'

const app = setupApp()

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`)
})
