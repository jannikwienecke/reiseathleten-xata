import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { API_VERSION, BASE_URL } from "./constants";
import invariant from "tiny-invariant";

export function createWooCommerceClient() {
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  invariant(key, `process.env.WOOCOMMERCE_CONSUMER_KEY is required`);
  invariant(secret, `process.env.WOOCOMMERCE_CONSUMER_SECRET is required`);

  const api = new WooCommerceRestApi({
    url: BASE_URL,
    consumerKey: key,
    consumerSecret: secret,
    version: API_VERSION,
  });

  return api;
}
