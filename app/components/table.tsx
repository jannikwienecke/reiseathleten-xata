import { Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import React, { Fragment, useEffect, useRef, useState } from "react";
import Select from "react-select";
import { classNames } from "~/utils/helper";
import { Tag, type TableActionType, ARecord } from "~/utils/lib/types";
import { Notification } from "./notification";
import { TagItem } from "./tag-item";

export type Column<T extends ARecord> = {
  accessorKey: keyof T;
  header: string;
  isColor?: boolean;
  formatValue?: (value: any) => string;
  disableSortBy?: boolean;
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
  onDetailView,
  disableSearch,
  compact,
  actions,
  onClickAction,
  isRunningCutomAction,
  onSearch,
  onSortBy,
  onSelectColumns,
  selectedColumns,
  onClickOnTag,
  tags,
  onClickTags,
}: {
  dataList: TData[];
  columns: Column<TData>[];
  selectedColumns?: Column<TData>[];
  title: string;
  subtitle?: string;
  onEdit?: (dataItem: TData) => void;
  tags?: Tag[];
  onClickTags?: () => void;
  onAdd?: () => void;
  onDelete?: (dataItem: TData) => void;
  onBulkDelete?: (dataItem: TData[]) => void;
  onDetailView?: (dataItem: TData) => void;
  disableSearch?: boolean;
  compact?: boolean;
  actions?: TableActionType<TData>[];
  onClickAction?: (action: TableActionType<TData>, dataItems: TData[]) => void;
  isRunningCutomAction?: boolean;
  onSearch?: (query: string) => void;
  onSortBy?: (column: Column<TData>) => void;
  onSelectColumns?: (selected: Column<TData>[]) => void;
  onClickOnTag?: (options: {
    col: Column<TData>;
    tags: Tag[];
    dataItem: TData;
  }) => void;
}) {
  const checkbox = useRef<any>();
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selected, _setSelected] = useState<TData[]>([]);

  const [showSelectColumns, setShowSelectColumns] = useState(false);

  const [searchParams] = useSearchParams();

  React.useEffect(
    // when closing the slide over, reset the selected items
    function resetSelectedAfterActionEnded() {
      const action = searchParams.get("action");
      if (action) return;
      _setSelected([]);
    },
    [searchParams]
  );

  const defaultQuery = searchParams.get("query") || "";

  useEffect(() => {
    const isIndeterminate =
      selected.length > 0 && selected.length < dataList.length;
    setChecked(selected.length === dataList.length);
    setIndeterminate(isIndeterminate);
    if (checkbox.current) checkbox.current.indeterminate = isIndeterminate;
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

  const [sortBy, setSortBy] = useState<{
    column: Column<TData> | null;
    direction: "asc" | "desc";
  }>();

  const [error, setError] = React.useState({
    message: "",
  });

  const timeoutRef = React.useRef<number>();
  function handleClickSortBy(column: Column<TData>) {
    if (column.disableSortBy) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setError({
        message: `Cannot be sorted by "${column.header}"`,
      });

      timeoutRef.current = window.setTimeout(() => {
        setError({
          message: "",
        });
      }, 3000);

      return;
    }

    onSortBy?.(column);

    setSortBy((prev) => {
      if (prev?.column === column) {
        return {
          column,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return {
        column,
        direction: "asc",
      };
    });
  }

  const [query, setQuery] = useState(defaultQuery);

  const handleSearch = (query: string) => {
    setQuery(query);
    onSearch?.(query);
  };

  const _sortBy = React.useCallback(
    (a: TData, b: TData) => {
      if (!sortBy?.column) return 0;

      const valueA = a[sortBy.column.accessorKey];
      const valueB = b[sortBy.column.accessorKey];

      if (sortBy.direction === "asc") {
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
      } else {
        if (valueA > valueB) return -1;
        if (valueA < valueB) return 1;
      }

      return 0;
    },
    [sortBy?.column, sortBy?.direction]
  );

  const dataListFiltered = React.useMemo(() => {
    if (onSearch) return dataList;

    return dataList
      .filter((dataItem) => {
        const values = Object.values(dataItem);
        const stringValues = values.map((v) => v && v.toString().toLowerCase());

        const isMatch = stringValues.some(
          (v) => v && v.includes(query ? query?.toLowerCase?.() : "")
        );
        return isMatch;
      })
      .sort(_sortBy);
  }, [_sortBy, dataList, onSearch, query]);

  const IconSortBy =
    sortBy?.direction === "asc" ? ChevronDownIcon : ChevronUpIcon;

  const handleSelectColumns = (selected: Column<TData>[]) => {
    onSelectColumns?.(selected);
    setShowSelectColumns(false);
  };

  const columnsToRender = React.useMemo(() => {
    if (!selectedColumns || selectedColumns.length === 0) return columns;

    return selectedColumns;
  }, [columns, selectedColumns]);

  if (columns.length === 0) return null;
  return (
    <>
      <div className="h-full flex flex-col">
        <div className="z-50 absolute top-0 -right-0">
          <Notification
            isOpen={error.message !== ""}
            isError={true}
            message={error.message}
            key={error.message}
          />
        </div>

        <div className="flex flex-row w-full justify-between">
          <div className="sm:flex sm:items-center flex flex-col flex-1">
            <div className="sm:flex-auto w-full">
              <h1
                className={clsx(
                  "font-semibold leading-9 -tracking-tight  text-black",
                  compact ? "text-base" : "text-2xl"
                )}
              >
                {title}
              </h1>

              {subtitle ? (
                <p className="mt-1 text-lg text-gray-700">
                  {subtitle ?? "All users that are currently registered."}
                </p>
              ) : null}
            </div>

            {/* search */}
            <div className="w-full">
              {!disableSearch ? (
                <div className="pb-4">
                  <Search title={title} onSearch={handleSearch} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col space-y-2 w-[33%] items-end">
            {actions?.length || onAdd || onEdit || !disableSearch ? (
              <div className="flex flex-row">
                <div>
                  <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex flex-row gap-1 sm:gap-2">
                    {selected.length < 2 ? (
                      <>
                        {selected.length === 1 && onDetailView ? (
                          <div className="">
                            <button
                              onClick={() => onDetailView?.(selected[0])}
                              type="button"
                              className={`block rounded-full  px-4 py-1.5 text-center text-sm font-semibold leading-6  shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 bg-white text-black border-2 border-black hover:bg-indigo-200 "
                     }`}
                            >
                              View Detail
                            </button>
                          </div>
                        ) : null}

                        {actions?.map((action) => {
                          return (
                            <div key={action.name} className="">
                              <button
                                onClick={() => {
                                  onClickAction?.(action, selected);
                                }}
                                type="button"
                                className={`
                              block rounded-full  px-4 py-1.5 text-center text-sm font-semibold leading-6  shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                              ${
                                selected.length === 0
                                  ? "bg-black text-white hover:bg-indigo-500 "
                                  : "bg-amber-400 text-black hover:bg-amber-300"
                              }`}
                              >
                                {isRunningCutomAction ? (
                                  <div>LOADING</div>
                                ) : (
                                  <>{action.label}</>
                                )}
                              </button>
                            </div>
                          );
                        })}

                        {(onAdd && selected.length === 0) ||
                        (onEdit && selected.length > 0) ? (
                          <>
                            <div className="">
                              <button
                                onClick={
                                  selected.length === 0
                                    ? onAdd
                                    : () => onEdit?.(selected[0])
                                }
                                type="button"
                                className={`block rounded-full  px-4 py-1.5 text-center text-sm font-semibold leading-6  shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                  ${
                    selected.length === 0
                      ? "bg-black text-white hover:bg-indigo-500 "
                      : "bg-amber-400 text-black hover:bg-amber-300"
                  }`}
                              >
                                {selected.length === 0
                                  ? `New ${title}`
                                  : `Edit ${title}`}
                              </button>
                            </div>
                          </>
                        ) : null}
                      </>
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
              </div>
            ) : null}

            {showSelectColumns ? (
              <SelectColumns
                // key={JSON.stringify(selectedColumns)}
                selectedColumns={
                  selectedColumns?.length === 0 || !selectedColumns
                    ? columns
                    : selectedColumns
                }
                onSelect={handleSelectColumns}
                columns={columns}
              />
            ) : null}
          </div>
        </div>

        <button onClick={onClickTags} className="flex flex-row justify-end p-2">
          {/* on overflow text 0 */}
          <div className="flex flex-row space-x-2 py-1 px-3 bg-blue-200 text-blue-700 rounded-full text-xs items-center ring-1 ring-blue-700 ring-offset-2 max-w-[14rem] truncate">
            <div>
              <Bars3Icon className="h-4 w-4" />
            </div>
            <div className="font-semibold">Tags: </div>
            <div className="whitespace-nowrap text-ellipsis truncate">
              {tags?.map?.((t) => t.label).join(", ")}
            </div>
          </div>
        </button>

        {dataList.length === 0 ? (
          <>
            <div className="flex flex-col items-center justify-center h-[33vh]">
              <h1 className="text-2xl font-semibold leading-9 tracking-tight  text-black">
                No {title.toLowerCase()} found.
              </h1>
            </div>
          </>
        ) : null}

        {dataList.length ? (
          <>
            <div
              className={clsx(
                `flow-root flex-1 overflow-scroll`,
                compact ? "mt-0" : ""
              )}
            >
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full align-middle sm:px-6 lg:px-8">
                  <div className="relative">
                    <table className="min-w-full table-fixed divide-y divide-gray-300 border-gray-100 border-[1px] overflow-hidden rounded-tl-lg rounded-tr-lg">
                      <thead className="">
                        <tr className="">
                          <th
                            scope="col"
                            className="relative px-7 sm:w-12 sm:px-6 bg-white "
                          >
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

                          {columnsToRender.map((column) => {
                            return (
                              <th
                                key={`column-${column.accessorKey.toString()}`}
                                scope="col"
                                className="group min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-black bg-white"
                              >
                                <div className="flex flex-row items-center space-x-1">
                                  <button
                                    className="group"
                                    onClick={() => handleClickSortBy(column)}
                                  >
                                    {column.header}
                                  </button>

                                  {onSelectColumns ? (
                                    <div className="group-hover:block hidden ">
                                      <button
                                        onClick={() =>
                                          setShowSelectColumns(true)
                                        }
                                        className="flex flex-row items-center space-x-1"
                                      >
                                        <PencilIcon className="h-4 w-4 text-gray-400" />
                                      </button>
                                    </div>
                                  ) : null}

                                  <button
                                    onClick={() => handleClickSortBy(column)}
                                    type="button"
                                    className="text-gray-400 hover:text-gray-700"
                                  >
                                    {sortBy &&
                                    sortBy.column?.accessorKey ===
                                      column.accessorKey ? (
                                      <IconSortBy className="h-4 w-4 text-gray-400" />
                                    ) : null}
                                  </button>
                                </div>
                              </th>
                            );
                          })}
                          {onDelete ? (
                            <th
                              scope="col"
                              className="relative py-1 pl-3 pr-4 sm:pr-3"
                            >
                              <span className="sr-only">Delete</span>
                            </th>
                          ) : null}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {/* <tbody
                  style={{
                    borderTop: "1px solid rgb(243 244 246)",
                  }}
                  className="divide-y divide-gray-100 bg-white border-t-[1px] border-t-red-200"
                > */}
                        {dataListFiltered.map((dataItem, index) => {
                          return (
                            <tr
                              key={`row-${dataItem.id}`}
                              className={
                                selected.includes(dataItem)
                                  ? "bg-gray-50"
                                  : undefined
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
                                    handleClickInputSelect(
                                      dataItem,
                                      e.target.checked
                                    )
                                  }
                                />
                              </td>

                              {columnsToRender.map((column, indexColumn) => {
                                const value = dataItem[column.accessorKey];

                                return (
                                  <>
                                    {/* COLOR */}
                                    {Array.isArray(value) ? (
                                      <>
                                        <td
                                          style={{
                                            maxWidth: "0rem",
                                          }}
                                          className="whitespace-nowrap text-sm text-gray-500 space-x-1 max-[10rem] overflow-scroll"
                                        >
                                          {value.length ? (
                                            value.map((v: any) => {
                                              return (
                                                <span
                                                  key={`${index}-${indexColumn}-${v.label}-1`}
                                                  role="button"
                                                  className="relative"
                                                  onClick={() =>
                                                    onClickOnTag?.({
                                                      col: column,
                                                      tags: value,
                                                      dataItem,
                                                    })
                                                  }
                                                >
                                                  <TagItem {...v} />
                                                </span>
                                              );
                                            })
                                          ) : (
                                            <button
                                              className="w-full text-left h-full text-gray-400 italic"
                                              aria-label="Add tag"
                                              onClick={() =>
                                                onClickOnTag?.({
                                                  col: column,
                                                  tags: [],
                                                  dataItem,
                                                })
                                              }
                                            >
                                              Add...
                                            </button>
                                          )}
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        {column.isColor ? (
                                          <td
                                            key={`${index}-${indexColumn}-${value}-1`}
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
                                              key={`${index}-${indexColumn}-${value}-2`}
                                              className={classNames(
                                                "whitespace-nowrap py-1 pr-3 text-sm font-medium",
                                                selected.includes(dataItem)
                                                  ? "text-indigo-600"
                                                  : "text-gray-900"
                                              )}
                                            >
                                              {column?.formatValue
                                                ? column?.formatValue?.(
                                                    dataItem[column.accessorKey]
                                                  )
                                                : dataItem[column.accessorKey]}
                                            </td>
                                          </>
                                        )}
                                      </>
                                    )}
                                  </>
                                );
                              })}

                              {onDelete ? (
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
                              ) : null}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
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

function Search({
  title,
  onSearch,
}: {
  title: string;
  onSearch: (query: string) => void;
}) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  return (
    <div>
      <div className="mt-2 flex w-[40%] border-0 overflow-hidden ">
        <div className="relative flex flex-grow items-stretch focus-within:z-1 over rounded-full w-[40%] border-0 ">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 rounded-full w-[40%] border-0 ">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            onChange={(e) => onSearch(e.target.value)}
            name="query"
            id="query"
            className="block w-full rounded-full border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder={`Search ${title}...`}
            defaultValue={query}
          />
        </div>
      </div>
    </div>
  );
}

const SelectColumns = ({
  columns,
  onSelect,
  selectedColumns: _selectedColumns,
}: {
  columns: Column<any>[];
  selectedColumns?: Column<any>[];
  onSelect: (selected: Column<any>[]) => void;
}) => {
  const [selectedColumns, setSelectedColumns] = useState<Column<any>[]>(
    _selectedColumns || []
  );

  const options = columns.map((column) => {
    return {
      value: column.accessorKey,
      label: column.header,
    };
  });

  const defaultOptions = selectedColumns?.map((column) => {
    return {
      value: column.accessorKey,
      label: column.header,
    };
  });

  return (
    <div className="flex flex-row space-x-2 items-center w-[100%]">
      <div className="grid place-items-center h-full ">
        <button
          onClick={() => {
            onSelect(selectedColumns);
          }}
          className="bg-white px-3 py-1 rounded-lg text-xs font-medium text-black ring-1 ring-black ring-offset-2 active:bg-gray-200 active:ring-offset-gray-200 active:ring-offset-1"
        >
          Save
        </button>
      </div>

      <Select
        onChange={(selected) => {
          const selectedColumns = selected.map((item) => {
            return columns.find((column) => column.accessorKey === item.value);
          });

          // @ts-ignore
          setSelectedColumns([...selectedColumns.filter(Boolean)]);
        }}
        defaultValue={defaultOptions}
        isMulti
        name="columns"
        options={options}
        className="basic-multi-select"
        classNamePrefix="select"
      />
    </div>
  );
};

// export const CommandbarTags = ({
//   isOpen,
//   onClose,
//   tags,
//   selected: _selected,
// }: {
//   isOpen: boolean;
//   onClose: (selected: Tag[]) => void;
//   tags: {
//     label: string;
//     color: string;
//   }[];
//   selected: {
//     label: string;
//     color: string;
//   }[];
// }) => {
//   return (
//     <>
//       <Commandbar.Base
//         isOpen={isOpen}
//         onClose={() => onClose(selected)}
//         afterLeave={() => setQuery("")}
//       >
//       </Commandbar.Base>
//     </>
//   );
// };
