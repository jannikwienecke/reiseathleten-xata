export const MOCK_SERVER_PORT = 3001;
export const MOCK_SERVER_URL = `http:/127.0.0.1:3001`;

// TODO change this to the real api url

const envIsProduction = process.env.NODE_ENV === "production";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

// check that when we build this IS_PRODUCTION is true

if (envIsProduction && !IS_PRODUCTION) {
  throw new Error("IS_PRODUCTION is false");
}
