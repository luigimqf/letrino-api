import { ErrorCode } from '../constants/error';
import { IUserRepository } from '../repositories/user.repository';
import { Either, Failure, Success } from '../utils/either';
import { Jwt } from '../utils/jwt';
import { DAY_IN_SECONDS, WEEK_IN_SECONDS } from '../constants/time';
import { OAuth2Client } from 'google-auth-library';

export interface ISocialSignInUseCase {
  execute({
    code,
  }: {
    code: string;
  }): Promise<
    Either<
      ErrorCode,
      { token: string; refresh_token: string; username: string }
    >
  >;
}

export class SocialSignInUseCase implements ISocialSignInUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authClient: OAuth2Client
  ) {}

  async execute({
    code,
  }: {
    code: string;
  }): Promise<
    Either<
      ErrorCode,
      { token: string; refresh_token: string; username: string }
    >
  > {
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

    const user = await this.userRepository.findOneBy({
      email: payload!.email!,
    });

    if (user.isFailure() || !user.value?.id) {
      return Failure.create(ErrorCode.USER_NOT_FOUND);
    }

    const { id, username, email } = user.value;

    const token = Jwt.sign({ email, id }, DAY_IN_SECONDS);
    const refreshToken = Jwt.sign({ email, id }, WEEK_IN_SECONDS);

    return Success.create({ token, refresh_token: refreshToken, username });
  }
}
