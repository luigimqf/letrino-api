import { ModelWithTimestamp } from '../../types';

export interface IUser extends ModelWithTimestamp {
  id: string;
  username: string;
  avatar?: string;
  externalId?: string;
  email: string;
  passwordHash: string;
}
