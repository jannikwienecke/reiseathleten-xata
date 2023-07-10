import { Entity } from "~/shared/domain/entity";

interface UserProps {
  email: string;
  password: string;
}

export class UserEntity extends Entity<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  static create(props: UserProps, id?: string) {
    return new UserEntity(props, id);
  }
}
