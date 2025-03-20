import {Request, Response} from 'express'
import {z} from 'zod'

const updatePasswordSchema = z.object({
  currentPassword: z.string({
    message: 'Current password is required'
  }).nonempty('Current password is required'),
  newPassword: z.string({
    message: 'New password is required'
  }).nonempty('New password is required'),
  confirmPassword: z.string({
    message: 'Confirm password must be equal to new password'
  }).nonempty('Confirm password must be equal to new password')
})

async function updatePassword(req: Request, res:  Response) {
  try {
    const {success, data, error} = updatePasswordSchema.safeParse(req.body);

    if(!success) {
      res.status(400).json({
        success: false,
        error: error.issues[0].message
      })
      return
    }

  } catch (error) {
    
  }
}