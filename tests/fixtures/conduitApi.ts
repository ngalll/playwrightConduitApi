import { test as base, expect } from "@playwright/test";
import { UserResponse } from "../../app/api/controllers/users/UserTypes";
import * as fs from "fs";
import { request as newRequest } from "@playwright/test";
import { ApiClient } from "../../app/api/ApiClient";

type ApiControllers = {
  client: ApiClient;
  userToLoginEmail: string | undefined;
};

export const test = base.extend<ApiControllers>({
  userToLoginEmail: undefined,

  request: async ({ request, userToLoginEmail }, use) => {
    if (userToLoginEmail) {
      if (fs.existsSync(`.auth/${userToLoginEmail}.json`)) {
        const token = fs.readFileSync(`.auth/${userToLoginEmail}.json`, {
          encoding: "utf8",
        });

        const context = await newRequest.newContext({
          extraHTTPHeaders: {
            authorization: `Token ${token}`,
          },
        });

        await use(context);
      } else {
        const response = await request.post("/api/users/login", {
          data: {
            user: {
              email: userToLoginEmail,
              password: process.env.CONDUIT_DEFAULT_PASSWORD,
            },
          },
          failOnStatusCode: true,
        });

        const responseJson: UserResponse = await response.json();
        const token = responseJson.user.token;
        fs.writeFileSync(`.auth/${userToLoginEmail}.json`, token!);

        const context = await newRequest.newContext({
          extraHTTPHeaders: {
            authorization: `Token ${token}`,
          },
        });

        await use(context);
      }
    } else await use(request);
  },
  client: async ({ request }, use) => {
    const client = new ApiClient(request);
    await use(client);
  },
});
