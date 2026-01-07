import { OAuth2Client } from 'google-auth-library';
import { AppDataSource } from '../config/db/data-source';
import { User } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { UserRepository } from '../repositories/user.repository';
import { env } from '../config/enviroment';
import { SocialSignUpUseCase } from '../usecases/social-sign-up.usecase';
import { SocialSignUpController } from '../controllers/social-sign-up.controller';

export const socialSignUpFactory = (): IController => {
  const authClient = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_SIGN_UP_REDIRECT_URI
  );
  const userRepository = new UserRepository(AppDataSource.getRepository(User));
  const socialSignUpUsecase = new SocialSignUpUseCase(
    userRepository,
    authClient
  );
  const socialSignUpController = new SocialSignUpController(
    socialSignUpUsecase
  );
  return socialSignUpController;
};
