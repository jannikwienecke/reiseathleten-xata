import type { MemberEntity } from "../domain/Member";

export interface UserRepo {
  signup({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<MemberEntity>;

  login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<MemberEntity | null>;
}
