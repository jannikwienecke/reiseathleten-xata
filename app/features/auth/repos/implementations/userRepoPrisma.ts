import type { PrismaClient } from "@prisma/client";
import type { UserRepo } from "../userRepo";
import { UserEntity } from "../../domain/User";

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
  }): Promise<UserEntity> {
    const user = await this.client.user.create({
      data: {
        email,
        password,
      },
    });

    return UserEntity.create({
      ...user,
    });
  }

  async login({ email }: { email: string }): Promise<UserEntity | null> {
    const user = await this.client.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) return null;

    return UserEntity.create({
      ...user,
    });
  }

  async hasUserWithEmail(email: string): Promise<boolean> {
    const user = await this.client.user.findFirst({
      where: {
        email,
      },
    });

    console.log({
      user,
      email,
    });

    return !!user;
  }
}
