import { PrismaClient } from "@prisma/client";
import { MemberEntity } from "../../domain/Member";
import type { UserRepo } from "../userRepo";
import { MOCK_SERVER_URL } from "~/shared/constants/base";

export class UserRepoMock implements UserRepo {
  private client: PrismaClient;
  constructor() {
    this.client = new PrismaClient();
  }

  async signup({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<MemberEntity> {
    const result = await fetch(`${MOCK_SERVER_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await result.json();

    if (!data) {
      throw new Error("Cannot create user");
    }

    return MemberEntity.create({
      ...data,
    });
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<MemberEntity | null> {
    const result = await fetch(`${MOCK_SERVER_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await result.json();

    if (!data) return null;

    return MemberEntity.create({
      ...data,
    });
  }
}
