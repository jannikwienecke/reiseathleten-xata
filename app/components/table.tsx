import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentPlusIcon,
  FolderIcon,
  FolderPlusIcon,
  HashtagIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PhoneArrowDownLeftIcon,
  PlusIcon,
  TagIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import React from "react";
import { useEffect, useRef, Fragment } from "react";
import { classNames } from "~/utils/helper";
import { Tag, type TableActionType } from "~/utils/lib/types";
import { Notification } from "./notification";
import { useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";
import Select from "react-select";
import { MultiValue, ActionMeta, InputActionMeta } from "react-select";
import { Popover } from "@headlessui/react";
import { SketchPicker } from "react-color";

type ARecord = Record<string, any>;

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
  onUpdateTags,
}: {
  dataList: TData[];
  columns: Column<TData>[];
  selectedColumns?: Column<TData>[];
  title: string;
  subtitle?: string;
  onEdit?: (dataItem: TData) => void;
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
  onUpdateTags?: (options: {
    newTags: Tag[];
    deletedTags: Tag[];
    id: string | number;
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

      console.log("set ERROR");

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

  const [commandBar, setCommandBar] = useState<{
    all: Tag[];
    selected: Tag[];
    dataItem?: TData;
  }>();

  const handleClickOnTag = ({
    col,
    tags,
    dataItem,
  }: {
    col: Column<TData>;
    tags: Tag[];
    dataItem: TData;
  }) => {
    const allTags = dataList
      .map((dataItem) => {
        return dataItem[col.accessorKey];
      })
      .flat();
    const labels = Array.from(new Set(allTags.map((t) => t.label)));

    setCommandBar({
      all: labels.map((label) => allTags.find((t) => t.label === label) as Tag),
      selected: tags,
      dataItem,
    });
  };

  const handleCloseCommandBar = (selected: Tag[]) => {
    const newTags =
      selected.filter((tag) => {
        return !commandBar?.selected.find((t) => t.label === tag.label);
      }) || [];

    const deletedTags =
      commandBar?.selected.filter((tag) => {
        return !selected.find((t) => t.label === tag.label);
      }) || [];

    const id = commandBar?.dataItem?.id as string | number;

    onUpdateTags?.({
      newTags,
      deletedTags,
      id,
    });

    setCommandBar(undefined);
  };

  return (
    <>
      <Commandbar
        tags={commandBar?.all || []}
        selected={commandBar?.selected || []}
        isOpen={!!commandBar}
        onClose={handleCloseCommandBar}
      />
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
          <div
            className={clsx(
              `flow-root flex-1 overflow-scroll`,
              compact ? "mt-0" : "mt-4"
            )}
          >
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
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
                                      onClick={() => setShowSelectColumns(true)}
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
                                                  handleClickOnTag({
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
                                              handleClickOnTag({
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
        ) : null}
      </div>
    </>
  );
}

const TagItem = ({
  label,
  color,
  onDelete,
}: {
  label: string;
  color: string;
  onDelete?: () => void;
}) => {
  return (
    <>
      <span
        style={{
          backgroundColor: color ? `${color}` : undefined,
        }}
        className={`inline-flex opacity-20 items-center rounded-md px-2 py-1 text-xs flex-row space-x-2`}
      >
        <div>{label}</div>

        {onDelete ? (
          <div>
            <XMarkIcon className="h-4 w-4 text-gray-400" />
          </div>
        ) : null}
      </span>

      <span
        style={{
          position: "absolute",
          left: "0",
          top: "2",
          color: color ? `${color}` : undefined,
        }}
        className={`inline-flex flex-row space-x-2 whitespace-nowrap items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-gray-200 ring-inset`}
      >
        <div>{label}</div>

        {onDelete ? (
          <div role="button" onClick={onDelete}>
            <XMarkIcon className="h-4 w-4 text-gray-400 cursor-pointer" />
          </div>
        ) : null}
      </span>
    </>
  );
};

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

const getRandomColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return randomColor;
};

function Commandbar({
  isOpen,
  onClose,
  tags,
  selected: _selected,
}: {
  isOpen: boolean;
  onClose: (selected: Tag[]) => void;
  tags: {
    label: string;
    color: string;
  }[];
  selected: {
    label: string;
    color: string;
  }[];
}) {
  const [selected, setSelected] = useState<Tag[]>(_selected);

  React.useEffect(() => {
    setSelected(_selected);
  }, [_selected]);

  const [query, setQuery] = useState("");

  const tagsWithoutSelected = tags.filter(
    (tag) => !selected.find((s) => s.label === tag.label)
  );

  const filteredProjects =
    query === ""
      ? tagsWithoutSelected
      : tagsWithoutSelected.filter((tag) => {
          return tag.label.toLowerCase().includes(query.toLowerCase());
        });

  const handleAddTag = (tag: Tag) => {
    const alreadyExists = selected.find((s) => s.label === tag.label);

    if (alreadyExists) return;

    setSelected([...selected, tag]);
    setQuery("");
    setColor(getRandomColor());
  };

  const [color, setColor] = useState(getRandomColor);

  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Transition.Root
      show={isOpen}
      as={Fragment}
      afterLeave={() => setQuery("")}
      appear
    >
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => onClose(selected)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-2xl transform divide-y divide-gray-500 divide-opacity-20 overflow-hidden rounded-xl bg-white  bg-opacity-80 shadow-2xl backdrop-blur backdrop-filter transition-all">
              {/* @ts-ignore */}
              <Combobox
                onChange={(item: any) => {
                  handleAddTag(item);
                }}
              >
                <div className="relative space-y-2 flex flex-col pl-4 pt-2">
                  {selected.length ? (
                    <div className="relative p-2 space-x-2 flex flex-row flex-wrap">
                      {selected.map((tag) => {
                        return (
                          <div key={tag.label} className="relative">
                            <TagItem
                              {...tag}
                              onDelete={() => {
                                setSelected(
                                  selected.filter((s) => s.label !== tag.label)
                                );
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  <Combobox.Input
                    ref={inputRef}
                    className="h-12 w-full border-0 bg-transparent pr-4 text-black focus:ring-0 sm:text-sm"
                    placeholder="Search..."
                    // on enter
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        query !== "" &&
                        filteredProjects.length === 0
                      ) {
                        event.preventDefault();
                        handleAddTag({
                          label: query,
                          color: `#${color}`,
                        });
                        // remove input -> empty valye -> not blur
                        if (inputRef.current) inputRef.current.value = "";
                      }
                    }}
                    onChange={(event) => {
                      setQuery(event.target.value);
                    }}
                  />
                </div>

                {(query === "" || filteredProjects.length > 0) && (
                  <Combobox.Options
                    static
                    className="max-h-80 scroll-py-2 divide-y divide-gray-500 divide-opacity-20 overflow-y-auto"
                  >
                    <li className="p-2">
                      {query === "" && (
                        <h2 className="mb-2 mt-4 px-3 text-xs font-semibold text-black">
                          {tagsWithoutSelected.length === 0 ? (
                            <>No available tags</>
                          ) : (
                            "Available Tags"
                          )}
                        </h2>
                      )}
                      <ul className="text-sm text-black">
                        {(query === ""
                          ? tagsWithoutSelected
                          : filteredProjects
                        ).map((tag) => (
                          <Combobox.Option
                            key={tag.label}
                            value={tag}
                            className={({ active }) =>
                              classNames(
                                "flex cursor-default select-none items-center rounded-md px-3 py-2",
                                active ? "bg-gray-800 text-white" : ""
                              )
                            }
                          >
                            {({ active }) => (
                              <>
                                <TagIcon
                                  style={{
                                    color: `${tag.color}`,
                                  }}
                                  className={classNames(
                                    "h-6 w-6 flex-none",
                                    active ? "text-white" : "text-gray-800"
                                  )}
                                  aria-hidden="true"
                                />
                                <span className="ml-3 flex-auto truncate ">
                                  {tag.label}
                                </span>
                                {active && (
                                  <span className="ml-3 flex-none text-gray-800">
                                    Assign Tag...
                                  </span>
                                )}
                              </>
                            )}
                          </Combobox.Option>
                        ))}
                      </ul>
                    </li>
                  </Combobox.Options>
                )}

                {query !== "" && filteredProjects.length === 0 && (
                  <div
                    role="button"
                    onClick={() =>
                      handleAddTag({ label: query, color: "green" })
                    }
                    className="flex flex-row space-x-2 justify-start items-center p-4 bg-gray-200 cursor-pointer"
                  >
                    <PlusIcon
                      className="h-6 w-6 text-gray-700"
                      aria-hidden="true"
                    />
                    <div className="text-sm text-black flex flex-row space-x-2 items-center ">
                      <p>Create Tag</p>
                      <div className="relative">
                        <TagItem label={query} color={`#${color}`} />
                      </div>
                    </div>
                  </div>
                )}
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
