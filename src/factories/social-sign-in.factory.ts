import { OAuth2Client } from 'google-auth-library';
import { AppDataSource } from '../config/db/data-source';
import { User } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { SocialSignInController } from '../controllers/social-sign-in.controller';
import { UserRepository } from '../repositories/user.repository';
import { SocialSignInUseCase } from '../usecases/social-sign-in.usecase';
import { env } from '../config/enviroment';

export const socialSignInFactory = (): IController => {
  const authClient = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );
  const userRepository = new UserRepository(AppDataSource.getRepository(User));
  const socialSignInUsecase = new SocialSignInUseCase(
    userRepository,
    authClient
  );
  const socialSignInController = new SocialSignInController(
    socialSignInUsecase
  );
  return socialSignInController;
};
