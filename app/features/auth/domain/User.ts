import { Entity } from "~/shared/domain/entity";

interface UserProps {
  email: string;
  password: string;
  id?: number;
}

export class UserEntity extends Entity<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  static create(props: UserProps, id?: string) {
    return new UserEntity(props, id);
  }

  get id() {
    return this.props.id || this._id;
  }
}
