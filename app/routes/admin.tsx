import { redirect } from "@remix-run/node";
import {
  Outlet,
  ShouldRevalidateFunction,
  useFetchers,
  useSearchParams,
} from "@remix-run/react";
import { Layout } from "~/components";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { CONFIG_ORDERS_PAGE } from "~/features/orders-sync/config";
import { CONFIG } from "~/features/vacation-admin/config";
import { isLoggedIn } from "~/utils/helper";
import { createPageFunction } from "~/utils/lib/core";
import { useAdminPage } from "~/utils/lib/hooks";
import { LibConfigProvider } from "~/utils/lib/react";
import { type DataFunctionArgs } from "~/utils/lib/types";

export const pageFunction = createPageFunction({
  config: {
    models: {
      ...CONFIG.models,
      ...CONFIG_ORDERS_PAGE.models,
    },
  },
});

export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return false;
};

export const loader = async (props: DataFunctionArgs) => {
  const url = new URL(props.request.url);
  const pathname = url.pathname;

  const user = await isLoggedIn(props.request, {
    failureRedirect: `/login?redirect=${pathname}?${url.searchParams}`,
  });

  if (!user) {
    return redirect("/login");
  }

  if (user?.props.email !== "admin@admin.de") {
    throw new Response("Unauthorized", { status: 401 });
  }

  if (pathname === "/admin") {
    return redirect("/admin/Vacation");
  }

  return pageFunction.loader(props);
};

export default function Index() {
  return (
    <LibConfigProvider
      config={{
        models: {
          ...CONFIG.models,
          ...CONFIG_ORDERS_PAGE.models,
        },
      }}
    >
      <Content />
    </LibConfigProvider>
  );
}

const Content = () => {
  const adminPageProps = useAdminPage({});

  const [searchParams] = useSearchParams();
  const editMode = searchParams.get("editMode") === "true";

  return (
    <Layout editable={editMode} {...adminPageProps.getLayoutProps()}>
      <Outlet />
    </Layout>
  );
};

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => (
          <p>No user with the username "{params.username}" exists</p>
        ),
        401: ({ params }) => (
          <p>
            You are not authorized to access this page. Please contact your IT
            department.
          </p>
        ),
      }}
    />
  );
}
