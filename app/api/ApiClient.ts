import { APIRequest, APIRequestContext } from "@playwright/test";
import { Users } from "./controllers/users/Users";

export class ApiClient {
  users: Users;
  constructor(request: APIRequestContext) {
    this.users = new Users(request);
  }
}
