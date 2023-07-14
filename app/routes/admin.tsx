import { DataFunctionArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { Layout } from "~/components";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { CONFIG } from "~/features/vacation-admin/config";
import { useAdminPage } from "~/utils/lib/hooks";
import { LibProvider } from "~/utils/lib/react";

export const loader = (props: DataFunctionArgs) => {
  // redirect to /admin/Vacation if is /admin

  const { request } = props;
  const url = new URL(request.url);
  const path = url.pathname;
  console.log("==path", path);

  if (path === "/admin") {
    // return redirect("/admin/Vacation");
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

  const {
    addForm,
    getOverlayProps,
    getFormProps,
    getFormFieldProps,
    getNotificationProps,
    getLayoutProps,
  } = adminPageProps;

  return (
    <Layout {...getLayoutProps()}>
      <Outlet />
    </Layout>
  );
};
