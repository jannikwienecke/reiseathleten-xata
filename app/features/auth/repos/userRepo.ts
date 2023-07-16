import type { UserEntity } from "../domain/User";

export interface UserRepo {
  signup({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<UserEntity>;

  login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<UserEntity | null>;

  hasUserWithEmail(email: string): Promise<boolean>;
}
