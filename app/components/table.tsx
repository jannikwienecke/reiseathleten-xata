import { ChevronDownIcon } from "@heroicons/react/20/solid";
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
}) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900 test">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-700">{subtitle}</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => {
              console.log("onAdd");
              onAdd?.();
            }}
          >
            Add New Item
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.accessorKey as string}
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      <a href="#" className="group inline-flex">
                        {column.header}
                        <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          <ChevronDownIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </span>
                      </a>
                    </th>
                  ))}

                  <th scope="col" className="relative py-3.5 pl-3 pr-0">
                    <span className="sr-only">DELETE</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {dataList.map((dataItem, index) => (
                  <tr className="group cursor-pointer" key={index}>
                    {columns.map((column) => {
                      const value = dataItem[column.accessorKey];
                      return (
                        <>
                          {/* COLOR */}
                          {column.isColor ? (
                            <td
                              role="button"
                              onClick={() => {
                                onEdit?.(dataItem);
                              }}
                              className="whitespace-nowrap px-3 py-5 text-sm text-gray-500"
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
                                role="button"
                                onClick={() => {
                                  console.log("Edit");

                                  onEdit?.(dataItem);
                                }}
                                className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0"
                              >
                                {value}
                              </td>
                            </>
                          )}
                        </>
                      );
                    })}

                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0  z-10">
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
  );
}
