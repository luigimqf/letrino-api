/* eslint-disable no-useless-escape */
import mongoose from 'mongoose'
import { IUser } from '../../models/user.model'

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function (v: string) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v)
      },
      message: (props: { value: string }) =>
        `${props.value} is not a valid email!`
    }
  },
  password: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  statistics: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Statistics'
  }
},
{timestamps: true}
)
export const User = mongoose.model('Users', userSchema)

