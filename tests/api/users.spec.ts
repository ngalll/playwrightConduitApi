import { faker } from "@faker-js/faker";
import { test } from "../fixtures/conduitApi";
import { expect } from "@playwright/test";
import { UserRegistration, UserResponse } from "../../app/api/controllers/users/UserTypes";

test("Login as existed user and token should be valid", async ({ client }) => {
  const response = await client.users.login({
    email: process.env.CONDUIT_DEFAULT_EMAIL!,
    password: process.env.CONDUIT_DEFAULT_PASSWORD!,
  });

  expect(response.status()).toBe(200);

  const token = await client.users.getTokenFromLogin(response);

  expect(token.length).toBeGreaterThan(10);
});

test("Login as non-existed user and get error message", async ({ client }) => {
  const response = await client.users.login({
    email: faker.internet.email(),
    password: process.env.CONDUIT_DEFAULT_PASSWORD!,
  });

  expect(response.status()).toBe(422);
  const error = (await response.json()).errors;

  expect(error).toEqual({ "email or password": "is invalid" });
});

test("Create user and token should be valid", async ({ client }) => {
  const registerBody = {
    user: {
      email: faker.internet.email(),
      password: faker.internet.password(),
      username: faker.internet.username().replaceAll(/[._-]/g, "") + Date.now(),
    },
  };

  const response = await client.users.createUser(registerBody.user);
  const json: UserResponse = await response.json();

  expect(response.status()).toBe(200);

  expect(json.user.email).toEqual(registerBody.user.email.toLocaleLowerCase());
  expect(json.user.username).toEqual(registerBody.user.username.toLocaleLowerCase());
  expect(json.user.token!.length).toBeGreaterThan(10);
});

test("Failed user creation with invalid username", async ({ client }) => {
  const registerBody = {
    user: {
      email: faker.internet.email(),
      password: faker.internet.password(),
      username: `${faker.internet.username()}_${Date.now()}`,
    },
  };

  const response = await client.users.createUser(registerBody.user);
  const error = (await response.json()).errors;

  expect(response.status()).toBe(422);

  expect(error).toEqual({"username":"is invalid"});
});
