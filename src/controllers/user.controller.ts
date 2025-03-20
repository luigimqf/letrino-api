import { Request, Response } from 'express'
import { User } from '../config/db/models/users'
import { z } from 'zod'

async function getUsers(_: Request, res: Response): Promise<void> {
  try {
    const users = await User.find()
    if (users.length <= 0) {
      res.status(404).send({
        success: false,
        error: 'No users found'
      })
    }
    res.status(200).json({
      success: true,
      data: users
    })
  } catch (error) {
    res.status(500).send({
      success: false,
      error: 'An error occurred'
    })
  }
}

const createUserSchema = z.object({
  name: z
    .string({
      message: 'Name must be a string'
    })
    .regex(/^[a-zA-Z\s]*$/, {
      message: 'Name must only contain letters'
    })
    .nonempty("Name is required"),
  email: z.string().email('Email is invalid'),
  password: z.string({
    message: 'Password must be a string'
  }).nonempty("password is required")
})

async function createUser(req: Request, res: Response) {
  try {
    const { success, data, error } = createUserSchema.safeParse(req.body)

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.issues[0].message
      })
      return
    }

    try {
      const newUser = new User(data)
      await newUser.save()
      res.status(201).json(newUser)
    } catch (error) {
      res.status(400).json({
        success: false,
        error
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred'
    })
  }
}

const idSchema = z.string({
  message: 'Id is required'
});

async function getUser(req: Request, res: Response) {
  try { 
    const { success, data, error } = idSchema.safeParse(req.params.id);

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.issues[0].message
      })
      return
    }

    const user = await User.findById(data);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error
    })
  }
}

const updateUserSchema = z.object({
  name: z
    .string({
      message: 'Name is required'
    })
    .regex(/^[a-zA-Z\s]*$/, {
      message: 'Name must only contain letters'
    })
    .optional()
});

async function updateUser(req: Request, res: Response) {
  try {
    const { success, data, error } = idSchema.safeParse(req.params.id);

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.issues[0].message
      })
      return
    }
  
    const { success: successBody, data: dataBody, error: errorBody } = updateUserSchema.safeParse(req.body);
  
    if (!successBody) {
      res.status(400).json({
        success: false,
        error: errorBody.issues[0].message
      })
      return
    }
  
    try {
      const user = await User.findByIdAndUpdate(data, dataBody);
  
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        data: 'User updated successfully'
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred'
    })
  }
}

async function deleteUser(req: Request, res: Response) {
  const {success, data, error} = idSchema.safeParse(req.params.id);

  if (!success) {
    res.status(400).json({
      success: false,
      error: error.issues[0].message
    })
    return
  }

  try {
    const deletedUser = await User.findByIdAndDelete(data);
    if (!deletedUser) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }
    
    res.status(204).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred'
    })
  }
}

export { getUsers, createUser, getUser, updateUser, deleteUser }
