import { type DataFunctionArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { Layout } from "~/components";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { CONFIG_ORDERS_PAGE } from "~/features/orders-sync/config";
import { CONFIG } from "~/features/vacation-admin/config";
import { isLoggedIn } from "~/utils/helper";
import { useAdminPage } from "~/utils/lib/hooks";
import { LibProvider } from "~/utils/lib/react";

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

  return {};
};

export default function Index() {
  return (
    <LibProvider
      config={{
        models: {
          ...CONFIG.models,
          ...CONFIG_ORDERS_PAGE.models,
        },
      }}
    >
      <Content />
    </LibProvider>
  );
}

const Content = () => {
  const adminPageProps = useAdminPage();

  const { getLayoutProps } = adminPageProps;

  return (
    <Layout {...getLayoutProps()}>
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
