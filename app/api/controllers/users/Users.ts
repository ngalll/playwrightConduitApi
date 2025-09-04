import { APIResponse, expect } from "@playwright/test";
import { BaseController } from "../BaseController";
import { UserRegistration } from "./UserTypes";

export class Users extends BaseController {
  async login(userData: { email: string; password: string }) {
    const data = { user: userData };
    const response = this.request.post("/api/users/login", {
      data,
    });

    return response;
  }

  async getTokenFromLogin(response: APIResponse) {
    const responseJson = await response.json();
    const token = responseJson.user.token;

    expect(token).toBeTruthy();
    return token;
  }

    async createUser(userData: UserRegistration) {
    const response = this.request.post("api/users", {
      data: { user: userData }
    });

    return response;
  }
}
