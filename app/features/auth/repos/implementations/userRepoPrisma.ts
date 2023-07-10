import type { PrismaClient } from "@prisma/client";
import { MemberEntity } from "../../domain/Member";
import type { UserRepo } from "../userRepo";

export class UserRepoPrisma implements UserRepo {
  private client: PrismaClient;
  constructor(client: PrismaClient) {
    this.client = client;
  }

  async signup({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<MemberEntity> {
    const user = await this.client.user.create({
      data: {
        email,
        password,
      },
    });

    return MemberEntity.create({
      ...user,
    });
  }

  async login({ email }: { email: string }): Promise<MemberEntity | null> {
    const user = await this.client.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) return null;

    return MemberEntity.create({
      ...user,
    });
  }
}
