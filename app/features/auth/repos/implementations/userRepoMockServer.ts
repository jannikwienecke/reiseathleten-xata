import { PrismaClient } from "@prisma/client";
import type { UserRepo } from "../userRepo";
import { MOCK_SERVER_URL } from "~/shared/constants/base";
import { UserEntity } from "../../domain/User";

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
  }): Promise<UserEntity> {
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

    return UserEntity.create({
      ...data,
    });
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<UserEntity | null> {
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

    return UserEntity.create({
      ...data,
    });
  }

  async hasUserWithEmail(email: string): Promise<boolean> {
    const result = await fetch(`${MOCK_SERVER_URL}/auth/hasUserWithEmail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    const data = await result.json();

    return Boolean(data.user);
  }
}
