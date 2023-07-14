import type { V2_MetaFunction } from "@remix-run/node";
import { GeneralErrorBoundary } from "~/components/error-boundary";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
    ></div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => (
          <p>No user with the username "{params.username}" exists</p>
        ),
        401: ({ params }) => (
          <p>No user with the username "{params.username}" exists</p>
        ),
      }}
    />
  );
}
