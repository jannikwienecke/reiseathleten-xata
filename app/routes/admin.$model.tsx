import { createPageFunction } from "~/utils/lib/core";
import { useAdminPage } from "~/utils/lib/hooks";
import { LibForm, LibProvider, LibSliderOver } from "~/utils/lib/react";
import { Table } from "~/utils/lib/components/table";
import { CONFIG } from "./admin";
import { Layout } from "~/components/layout";
import { Fragment, useState } from "react";
import { Transition } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/20/solid";

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
            console.log(field.getOptions());

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

function Notification({
  message,
  isError,
  subMessage,
  onClose,
  isOpen,
}: {
  isError?: boolean;
  message: string;
  subMessage?: string;
  onClose?: () => void;
  isOpen?: boolean;
}) {
  const [show, setShow] = useState(isOpen ?? false);

  const handleClose = () => {
    onClose?.();
    setShow(false);
  };

  return (
    <>
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-start">
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {!isError ? (
                      <CheckCircleIcon
                        className="h-6 w-6 text-green-400"
                        aria-hidden="true"
                      />
                    ) : (
                      <XMarkIcon
                        className="h-6 w-6 text-red-400"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {message}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{subMessage}</p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={handleClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
}

// HIER WEITER MACHEN
// DROPDOWN FOR OPTIONS IN INPUT
