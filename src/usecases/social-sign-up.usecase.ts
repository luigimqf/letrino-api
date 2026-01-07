import { ErrorCode } from '../constants/error';
import { IUserRepository } from '../repositories/user.repository';
import { Either, Failure, Success } from '../utils/either';
import { OAuth2Client } from 'google-auth-library';
import { Jwt } from '../utils/jwt';
import { DAY_IN_SECONDS, WEEK_IN_SECONDS } from '../constants/time';

export interface ISocialSignUpUseCase {
  execute({
    code,
    username,
  }: {
    code: string;
    username: string;
  }): Promise<Either<ErrorCode, ISocialSignUpReturn>>;
}

interface ISocialSignUpReturn {
  token: string;
  refresh_token: string;
  username: string;
}

export class SocialSignUpUseCase implements ISocialSignUpUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authClient: OAuth2Client
  ) {}

  async execute({
    code,
    username,
  }: {
    code: string;
    username: string;
  }): Promise<Either<ErrorCode, ISocialSignUpReturn>> {
    const { tokens } = await this.authClient.getToken(code);

    if (!tokens.id_token) {
      return Failure.create(ErrorCode.SOCIAL_AUTH_FAILED);
    }

    this.authClient.setCredentials(tokens);

    const ticket = await this.authClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const userWithEmail = await this.userRepository.findOneBy({
      email: payload!.email!,
    });

    if (userWithEmail.isSuccess() && userWithEmail.value?.id) {
      return Failure.create(ErrorCode.FOUND_EMAIL);
    }

    const userWithUsername = await this.userRepository.findOneBy({
      username,
    });

    if (userWithUsername.isSuccess() && userWithUsername.value?.id) {
      return Failure.create(ErrorCode.FOUND_USERNAME);
    }

    const newUser = await this.userRepository.create({
      email: payload!.email!,
      username,
      avatar: payload!.picture!,
      externalId: payload!.sub!,
    });

    if (newUser.isFailure()) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    const { id, username: userUsername, email: userEmail } = newUser.value;

    const token = Jwt.sign({ userEmail, id }, DAY_IN_SECONDS);
    const refreshToken = Jwt.sign({ userEmail, id }, WEEK_IN_SECONDS);

    return Success.create({
      token,
      refresh_token: refreshToken,
      username: userUsername,
    });
  }
}
