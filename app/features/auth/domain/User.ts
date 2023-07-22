import { Entity } from "~/shared/domain/entity";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";

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

  static async generatePasswordHash(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  static async generateDefaultPassword() {
    const password = process.env.DEFAULT_USER_PASSWORD;
    invariant(password, "DEFAULT_USER_PASSWORD is not set");
    return UserEntity.generatePasswordHash(password);
  }
}
