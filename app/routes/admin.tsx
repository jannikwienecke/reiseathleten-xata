import { DataFunctionArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { Layout } from "~/components";
import { CONFIG } from "~/features/vacation-admin/config";
import { useAdminPage } from "~/utils/lib/hooks";
import { LibProvider } from "~/utils/lib/react";

export const loader = (props: DataFunctionArgs) => {
  const { request } = props;
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/admin") {
    return redirect("/admin/Vacation");
  }

  return {};
};

export default function Index() {
  return (
    <LibProvider config={CONFIG}>
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
