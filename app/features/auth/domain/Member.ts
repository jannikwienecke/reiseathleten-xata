import { Entity } from "~/shared/domain/entity";

interface UserProps {
  id: number;
  email: string;
  password: string;
}

export class MemberEntity extends Entity<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  static create(props: UserProps, id?: string) {
    return new MemberEntity(props, id);
  }
}
