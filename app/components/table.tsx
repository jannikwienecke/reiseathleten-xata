import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useEffect, useState, useRef, Fragment } from "react";
import { classNames } from "~/utils/helper";

type ARecord = Record<string, any>;

export type Column<T extends ARecord> = {
  accessorKey: keyof T;
  header: string;
  isColor?: boolean;
};

export function Table<TData extends ARecord>({
  columns,
  dataList,
  title,
  subtitle,
  onEdit,
  onBulkDelete,
  onAdd,
  onDelete,
}: {
  dataList: TData[];
  columns: Column<TData>[];
  title: string;
  subtitle?: string;
  onEdit?: (dataItem: TData) => void;
  onAdd?: () => void;
  onDelete?: (dataItem: TData) => void;
  onBulkDelete?: (dataItem: TData[]) => void;
}) {
  const checkbox = useRef<any>();
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selected, _setSelected] = useState<TData[]>([]);

  useEffect(() => {
    const isIndeterminate =
      selected.length > 0 && selected.length < dataList.length;
    setChecked(selected.length === dataList.length);
    setIndeterminate(isIndeterminate);
    checkbox.current.indeterminate = isIndeterminate;
  }, [dataList.length, selected]);

  function toggleAll() {
    _setSelected(checked || indeterminate ? [] : dataList);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  function handleClickInputSelect(dataItem: TData, checked: boolean) {
    if (!onBulkDelete) {
      // _setSelected([dataItem]);
      checked ? _setSelected([dataItem]) : _setSelected([]);
    } else {
      _setSelected(
        checked
          ? [...selected, dataItem]
          : selected.filter((p) => p !== dataItem)
      );
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {subtitle ?? "All users that are currently registered."}
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex flex-row gap-1 sm:gap-2">
          {selected.length < 2 ? (
            <div className="">
              <button
                onClick={onAdd}
                type="button"
                className={`block rounded-md  px-3 py-1.5 text-center text-sm font-semibold leading-6  shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                  ${
                    selected.length === 0
                      ? "bg-indigo-600 text-white hover:bg-indigo-500 "
                      : "bg-amber-400 text-black hover:bg-amber-300"
                  }`}
              >
                {selected.length === 0 ? "Add" : "Edit"}
              </button>
            </div>
          ) : (
            <>
              <div className="">
                <ActionDropdown
                  onBulkDelete={() => {
                    onBulkDelete?.(selected);
                    _setSelected([]);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        ref={checkbox}
                        checked={checked}
                        onChange={toggleAll}
                        style={{
                          display: onBulkDelete ? "block" : "none",
                        }}
                        // style={{
                        //   left: "1.5rem",
                        //   top: "1.25rem",
                        // }}
                      />
                    </th>

                    {columns.map((column) => {
                      return (
                        <th
                          key={`column-${column.accessorKey.toString()}`}
                          scope="col"
                          className="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
                        >
                          {column.header}
                        </th>
                      );
                    })}

                    <th scope="col" className="relative py-1 pl-3 pr-4 sm:pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {dataList.map((dataItem) => (
                    <tr
                      key={`row-${dataItem.id}`}
                      className={
                        selected.includes(dataItem) ? "bg-gray-50" : undefined
                      }
                    >
                      <td className="relative px-7 sm:w-12 sm:px-6">
                        {selected.includes(dataItem) && (
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />
                        )}
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          value={dataItem.email}
                          checked={selected.includes(dataItem)}
                          onChange={(e) =>
                            handleClickInputSelect(dataItem, e.target.checked)
                          }
                        />
                      </td>

                      {columns.map((column) => {
                        const value = dataItem[column.accessorKey];
                        return (
                          <>
                            {/* COLOR */}
                            {column.isColor ? (
                              <td
                                role="button"
                                className="whitespace-nowrap px-3 py-2 text-sm text-gray-500"
                              >
                                <span
                                  style={{
                                    backgroundColor: `${value}`,
                                    color: "white",
                                  }}
                                  className={`inline-flex  items-center rounded-md  px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20`}
                                >
                                  {value}
                                </span>
                              </td>
                            ) : (
                              <>
                                <td
                                  className={classNames(
                                    "whitespace-nowrap py-1 pr-3 text-sm font-medium",
                                    selected.includes(dataItem)
                                      ? "text-indigo-600"
                                      : "text-gray-900"
                                  )}
                                >
                                  {dataItem[column.accessorKey]}
                                </td>
                              </>
                            )}
                          </>
                        );
                      })}

                      <td className="whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            onDelete?.(dataItem);
                          }}
                          className="text-red-600 z-20 hover:text-indigo-900 bg-red-100 hover:bg-indigo-100 px-2 py-1 rounded-md text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionDropdown({ onBulkDelete }: { onBulkDelete?: () => void }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-700">
          Options
          <ChevronDownIcon
            className="-mr-1 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onBulkDelete}
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  Delete All
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
