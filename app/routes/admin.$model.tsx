import {
  Outlet,
  ShouldRevalidateFunction,
  useLoaderData,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { LibForm, Notification, Table } from "~/components";
import { Commandbar } from "~/components/command-bar";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { CONFIG_ORDERS_PAGE } from "~/features/orders-sync/config";
import { CONFIG } from "~/features/vacation-admin/config";
import { createPageFunction } from "~/utils/lib/core";
import { useAdminPage, useCommandbar } from "~/utils/lib/hooks";
import { LibProvider, LibSliderOver, useLib } from "~/utils/lib/react";

export const pageFunction = createPageFunction({
  config: {
    models: {
      ...CONFIG.models,
      ...CONFIG_ORDERS_PAGE.models,
    },
  },
});

export const loader = pageFunction.loader;
export const action = pageFunction.action;

export const shouldRevalidate: ShouldRevalidateFunction = ({
  actionResult,
  currentParams,
  currentUrl,
  defaultShouldRevalidate,
  formAction,
  formData,
  formEncType,
  formMethod,
  nextParams,
  nextUrl,
}) => {
  const currentEditMode = new URL(currentUrl).searchParams.get("editMode");
  const nextEditMode = new URL(nextUrl).searchParams.get("editMode");

  if (currentEditMode !== nextEditMode) {
    return false;
  }

  return true;
};
export default function AdminModelPage() {
  const { state } = useNavigation();

  const adminPageProps = useAdminPage({});

  const isLoading = state === "loading";
  return (
    <>
      <LibProvider admin={adminPageProps}>
        <div
          className={`${
            isLoading ? "block" : "hidden"
          } absolute top-0 left-0 z-50 inset-0 bg-white bg-opacity-40`}
        >
          <div className="flex items-center justify-center h-screen">
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-indigo-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>

        <Content />
      </LibProvider>
    </>
  );
}

const Content = () => {
  const adminPageProps = useLib();

  const {
    addForm,
    getOverlayProps,
    getFormProps,
    getFormFieldProps,
    getNotificationProps,
    commandbar,
  } = adminPageProps;

  const { id } = useParams();

  return (
    <>
      <>
        {id ? (
          <Outlet />
        ) : (
          <>
            <LibSliderOver {...getOverlayProps()}>
              <LibForm {...getFormProps()}>
                {addForm?.fields.map((field) => {
                  return (
                    <field.Component
                      {...getFormFieldProps(field)}
                      key={field.name}
                    />
                  );
                })}
              </LibForm>
            </LibSliderOver>
            <TableView {...adminPageProps} />
          </>
        )}
        <MainCommandbar {...commandbar} />
      </>

      <div className="z-50 absolute top-0 -right-0">
        <Notification {...getNotificationProps()} />
      </div>
    </>
  );
};

const TableView = (props: ReturnType<typeof useAdminPage>) => {
  return (
    <Table
      {...props}
      tags={props.tags}
      key={props.model}
      selectedColumns={props.selectedColumns}
      onAdd={props.handelClickAdd}
      onEdit={props.handleClickEdit}
      onDelete={props.handelClickDelete}
      onBulkDelete={props.handleClickBulkDelete}
      onDetailView={props.handleClickDetailView}
      onSearch={props.handleSearchChange}
      onSortBy={props.handleSortChange}
      onSelectColumns={props.handleSelectColumns}
      dataList={props.optimisicData}
      title={props.pageTitle || ""}
      subtitle={props.pageSubtitle || ""}
      onClickOnTag={props.tagsCombobox.handleClickOnTag}
      onClickTags={props.commandbar.handleClickTags}
    />
  );
};

export const MainCommandbar = ({
  tagsCombobox,
  isOpen,
  onClose,
  commandbarConfig,
  onSelect,
  showCustomViewForm,
  createCustomViewFormItems,
  showTags,
  activeItem,
  onBack,
}: ReturnType<typeof useCommandbar>) => {
  const listItems = activeItem?.list || commandbarConfig.actions;

  const view = activeItem?.form ? (
    <Commandbar.Form
      {...activeItem.form}
      name={activeItem.name}
      onBack={onBack}
    />
  ) : showTags || tagsCombobox.isOpen ? (
    <Commandbar.Tags {...tagsCombobox} />
  ) : (
    <Commandbar.Combobox
      items={listItems}
      onSelect={onSelect}
      quickActions={[]}
      recent={listItems}
    />
  );

  return (
    <Commandbar.Base onClose={onClose} isOpen={isOpen}>
      {view}
    </Commandbar.Base>
  );
};

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => (
          <div className="bg-white h-screen">
            <h1 className="text-2xl text-center font-bold leading-9 tracking-tight text-black">
              Model Not Found
            </h1>
            <h3 className="text-xl text-center font-semibold leading-9 tracking-tight text-gray-700">
              This Model does not exist. Please check the URL and try again.
            </h3>

            <div className="grid place-items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 400 300"
                width="406"
                height="306"
                className="illustration styles_illustrationTablet__1DWOa"
              >
                <g
                  id="_146_404_page_not_found_flatline"
                  data-name="#146_404_page_not_found_flatline"
                >
                  <path
                    d="M98.53,188.69H49.36V169.25L95.91,96.56h22.22v74.49H135v17.64H118.13v23.52H98.53Zm0-64.36H98.2L69.29,171.05H98.53Z"
                    fill="#68e1fd"
                  ></path>
                  <path
                    d="M314.21,188.69H265.05V169.25L311.6,96.56h22.22v74.49h16.82v17.64H333.82v23.52H314.21Zm3.42-64.36h-.33l-28.91,46.72h29.24Z"
                    fill="#68e1fd"
                  ></path>
                  <path
                    d="M196.48,102.33a51.95,51.95,0,1,0,51.94,52A51.94,51.94,0,0,0,196.48,102.33Z"
                    fill="#fff"
                    stroke="#231f20"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.03"
                  ></path>
                  <ellipse
                    cx="223.71"
                    cy="137.38"
                    rx="2.4"
                    ry="3.57"
                    fill="#231f20"
                  ></ellipse>
                  <path
                    d="M135.46,138.89l122-27-24-7s-13-21.55-16.47-22-66.53,13-66.53,13l-4,30.36Z"
                    fill="#231f20"
                  ></path>
                  <path
                    d="M176.27,165.1s31-12.39,44.56,10.69"
                    fill="#fff"
                  ></path>
                  <path
                    d="M220.83,176.31a.51.51,0,0,1-.44-.26c-13.19-22.43-43.63-10.59-43.93-10.47a.52.52,0,0,1-.39-1c.32-.12,31.57-12.29,45.21,10.91a.53.53,0,0,1-.18.71A.54.54,0,0,1,220.83,176.31Z"
                    fill="#231f20"
                  ></path>
                  <polygon
                    points="160.86 211.99 147.07 190.19 207.35 179.88 211.49 200.77 217.61 181.53 248.45 187.62 242.18 211.99 160.86 211.99"
                    fill="#231f20"
                  ></polygon>
                  <path
                    d="M239.69,164.23h5.61a0,0,0,0,1,0,0v20.94a2.64,2.64,0,0,1-2.64,2.64h-.33a2.64,2.64,0,0,1-2.64-2.64V164.23A0,0,0,0,1,239.69,164.23Z"
                    transform="translate(-21.84 34.9) rotate(-7.88)"
                    fill="#fff"
                  ></path>
                  <path
                    d="M243.59,188.25a3.15,3.15,0,0,1-3.11-2.71l-2.87-20.75a.5.5,0,0,1,.43-.56l5.55-.77a.5.5,0,0,1,.37.1.47.47,0,0,1,.19.33L247,184.63a3.12,3.12,0,0,1-2.68,3.54l-.32.05A3.11,3.11,0,0,1,243.59,188.25Zm-4.92-23.1,2.8,20.25a2.15,2.15,0,0,0,2.41,1.83l.33,0h0a2.14,2.14,0,0,0,1.82-2.41l-2.8-20.25Z"
                    fill="#231f20"
                  ></path>
                  <rect
                    x="235.19"
                    y="145.7"
                    width="9.05"
                    height="20.48"
                    transform="translate(-19.11 34.33) rotate(-7.88)"
                    fill="#fff"
                  ></rect>
                  <path
                    d="M236.64,167.21a.54.54,0,0,1-.3-.1.45.45,0,0,1-.19-.33l-2.81-20.3a.49.49,0,0,1,.09-.37.53.53,0,0,1,.33-.19l9-1.24a.49.49,0,0,1,.56.43l2.81,20.29a.5.5,0,0,1-.43.56l-9,1.24Zm-2.24-20.37,2.67,19.3,8-1.1-2.67-19.3Z"
                    fill="#231f20"
                  ></path>
                  <rect
                    x="240.98"
                    y="179.98"
                    width="9.05"
                    height="35.62"
                    rx="3.2"
                    transform="translate(-24.79 35.51) rotate(-7.88)"
                    fill="#fff"
                  ></rect>
                  <path
                    d="M246.19,216.14a3.7,3.7,0,0,1-3.66-3.19l-4-28.95a3.68,3.68,0,0,1,.71-2.74,3.72,3.72,0,0,1,2.44-1.43l2.64-.36a3.69,3.69,0,0,1,4.16,3.15l4,29a3.7,3.7,0,0,1-3.15,4.16h0l-2.64.37Zm3.08-.89h0Zm-4.44-34.82a2.31,2.31,0,0,0-.37,0l-2.64.36a2.67,2.67,0,0,0-1.78,1.05,2.63,2.63,0,0,0-.52,2l4,29a2.71,2.71,0,0,0,3,2.3l2.64-.37a2.7,2.7,0,0,0,2.3-3l-4-29a2.7,2.7,0,0,0-2.66-2.33Z"
                    fill="#231f20"
                  ></path>
                  <circle cx="237.6" cy="140.62" r="24.03" fill="#fff"></circle>
                  <path
                    d="M237.58,165.15a24.54,24.54,0,1,1,24.32-27.9h0A24.57,24.57,0,0,1,241,164.92,25.71,25.71,0,0,1,237.58,165.15Zm0-48.07a23.77,23.77,0,0,0-3.25.22,23.54,23.54,0,1,0,26.54,20.09h0A23.58,23.58,0,0,0,237.62,117.08Z"
                    fill="#231f20"
                  ></path>
                  <circle cx="237.6" cy="140.62" r="19.52" fill="#fff"></circle>
                  <path
                    d="M237.59,160.64a20,20,0,1,1,2.75-.19A19.66,19.66,0,0,1,237.59,160.64Zm0-39a19.78,19.78,0,0,0-2.65.18,19,19,0,1,0,2.65-.18Z"
                    fill="#231f20"
                  ></path>
                  <path
                    d="M260.55,194.79a14.57,14.57,0,0,0-4.9-4c-5.73-3-12.3-2.9-18.33-1-2.14.68-6.29,1.65-6.51,4.49a2.64,2.64,0,0,0,1.91,2.5,7.86,7.86,0,0,0,3.35.13,8.65,8.65,0,0,0-4.53,1.14c-1.29.91-2,2.9-.94,4.11a3.39,3.39,0,0,0,1.75,1,8,8,0,0,0,4.45-.06,20.74,20.74,0,0,0-4.55,1.43c-.88.39-1.86,1.08-1.76,2s1,1.34,1.82,1.62a18.75,18.75,0,0,0,5.35,1,10.54,10.54,0,0,0-4.35,1.87c-2,1.68-2,4.87.71,5.78a8,8,0,0,0,2.68.31c8,0,17.58-1,23-7.66a12.43,12.43,0,0,0,2.56-11.31A10.84,10.84,0,0,0,260.55,194.79Z"
                    fill="#fff"
                  ></path>
                  <path
                    d="M236.64,217.58a8.43,8.43,0,0,1-2.78-.33,3.45,3.45,0,0,1-2.38-2.63,4.36,4.36,0,0,1,1.5-4,7.46,7.46,0,0,1,2.16-1.25,18.61,18.61,0,0,1-3-.77c-1.33-.46-2-1.14-2.15-2s.62-1.9,2-2.55l.71-.3a5.29,5.29,0,0,1-.54-.13,3.77,3.77,0,0,1-2-1.14,2.76,2.76,0,0,1-.59-2.16,4,4,0,0,1,1.62-2.67,4.88,4.88,0,0,1,1-.54,3.07,3.07,0,0,1-1.91-2.87c.23-2.92,3.84-4,6.22-4.73l.64-.19c6.68-2.11,13.33-1.74,18.71,1a15,15,0,0,1,5.07,4.18,11.47,11.47,0,0,1,1.81,3.48,12.89,12.89,0,0,1-2.65,11.78c-5.67,6.93-15.49,7.83-23.41,7.84Zm-.95-13.79a19.74,19.74,0,0,0-3.24,1.13c-.47.21-1.54.78-1.46,1.52s.84,1,1.48,1.21a18.11,18.11,0,0,0,5.21,1,.49.49,0,0,1,.48.44.5.5,0,0,1-.37.54,10.4,10.4,0,0,0-4.16,1.77,3.31,3.31,0,0,0-1.17,3.06,2.44,2.44,0,0,0,1.72,1.87,7.2,7.2,0,0,0,2.51.28c7.71,0,17.24-.86,22.64-7.47a11.9,11.9,0,0,0,2.48-10.85,10.48,10.48,0,0,0-1.66-3.17h0a13.88,13.88,0,0,0-4.73-3.9c-5.15-2.65-11.52-3-17.95-1l-.65.2c-2.12.64-5.34,1.61-5.52,3.85a2.17,2.17,0,0,0,1.58,2,4.85,4.85,0,0,0,1.79.22c.47-.05.93-.08,1.37-.11a.52.52,0,0,1,.53.46.51.51,0,0,1-.45.54c-.45,0-.92.1-1.4.11a6.15,6.15,0,0,0-2.89.94,3,3,0,0,0-1.21,2,1.79,1.79,0,0,0,.36,1.39,2.91,2.91,0,0,0,1.5.82,7.68,7.68,0,0,0,3,.2c.4-.1.81-.19,1.21-.27a.5.5,0,0,1,.58.37.51.51,0,0,1-.34.6A7.66,7.66,0,0,1,235.69,203.79Z"
                    fill="#231f20"
                  ></path>
                  <path
                    d="M204.79,141s12.18,18.3,4.81,18.56-8-1.67-8-1.67"
                    fill="#fff"
                  ></path>
                  <path
                    d="M208.28,160.14c-6.18,0-7.07-1.69-7.19-2a.53.53,0,0,1,.33-.66.52.52,0,0,1,.65.33h0s.9,1.55,7.51,1.31a1.69,1.69,0,0,0,1.62-.84c1.58-3.07-4.4-13.25-6.84-16.91a.52.52,0,0,1,.86-.58c.93,1.4,9,13.8,6.9,18a2.68,2.68,0,0,1-2.5,1.41Z"
                    fill="#231f20"
                  ></path>
                  <ellipse
                    cx="238.71"
                    cy="140.01"
                    rx="4.42"
                    ry="7.53"
                    fill="#d1d3d4"
                  ></ellipse>
                  <ellipse
                    cx="184.62"
                    cy="140.01"
                    rx="3.37"
                    ry="6.09"
                    fill="#231f20"
                  ></ellipse>
                </g>
              </svg>
            </div>
          </div>
        ),
        401: ({ params }) => <div>Unauthorized</div>,
      }}
    />
  );
}
