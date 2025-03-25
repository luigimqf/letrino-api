export class Failure<T> {
  readonly error: T;

  private constructor(error: T) {
    this.error = error;
  }

  isFailure(): this is Failure<T> {
    return true;
  }

  isSuccess(): this is Success<never> {
    return false;
  }

  static create<U>(error: U) {
    return new Failure(error);
  }
}
export class Success<T> {
  readonly value: T;

  private constructor(value: T) {
    this.value = value;
  }

  isFailure(): this is Failure<never> {
    return false;
  }

  isSuccess(): this is Success<T> {
    return true;
  }

  static create<U>(value: U) {
    return new Success(value);
  }
}

export type Either<T, U> = Failure<T> | Success<U>;