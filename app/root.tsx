import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

// import styles from "./tailwind.css";
import picker from "./picker.css";
import styles from "./tailwind.css";

export const links: LinksFunction = () => [
  // { rel: "stylesheet", href: cssBundleHref },
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: picker },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-white">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
