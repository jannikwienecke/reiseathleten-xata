import { Layout, Notification, Table } from "~/components";
import { createPageFunction } from "~/utils/lib/core";
import { useAdminPage } from "~/utils/lib/hooks";
import { LibForm, LibProvider, LibSliderOver } from "~/utils/lib/react";
import { CONFIG } from "./admin";

export const pageFunction = createPageFunction({
  config: CONFIG,
});

export const loader = pageFunction.loader;

export const action = pageFunction.action;

export default function AdminModelPage() {
  return (
    <LibProvider config={CONFIG}>
      <Content />
    </LibProvider>
  );
}

const Content = () => {
  const {
    pageTitle,
    optimisicData,
    columns,
    handleClickEdit,
    handelClickAdd,
    handelClickDelete,
    handleClickBulkDelete,
    addForm,
    getOverlayProps,
    getFormProps,
    getFormFieldProps,
    getNotificationProps,
  } = useAdminPage();

  return (
    <>
      <Layout>
        <Table
          onEdit={handleClickEdit}
          onAdd={handelClickAdd}
          onDelete={handelClickDelete}
          onBulkDelete={handleClickBulkDelete}
          columns={columns}
          dataList={optimisicData}
          title={pageTitle}
          subtitle="Manage locations for your events"
        />
      </Layout>

      <LibSliderOver {...getOverlayProps()}>
        <LibForm {...getFormProps()}>
          {addForm.fields.map((field) => {
            return (
              <field.Component {...getFormFieldProps(field)} key={field.name} />
            );
          })}
        </LibForm>
      </LibSliderOver>

      <div className="z-50 absolute top-0 -right-0">
        <Notification {...getNotificationProps()} />
      </div>
    </>
  );
};
