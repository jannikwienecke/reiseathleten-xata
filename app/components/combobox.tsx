import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { classNames } from "~/utils/helper";

export type Color =
  | "blue"
  | "red"
  | "green"
  | "yellow"
  | "indigo"
  | "purple"
  | "pink"
  | "gray"
  | "white";

export const ComboBox = <
  TItem extends { name: string; id: string | number; color: Color }
>({
  items,
  onSelect,
  onQueryChange,
}: {
  items: TItem[];
  onSelect: (item: TItem) => void;
  onQueryChange?: (query: string) => void;
}) => {
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<TItem>();

  const filteredItems =
    query === ""
      ? items
      : items.filter((item) => {
          return item.name.toLowerCase().includes(query.toLowerCase());
        });

  const handleChangeItem = (item: TItem) => {
    setSelectedItem(item);
    onSelect(item);
  };

  const handleQueryChange = (query: string) => {
    setQuery(query);
    onQueryChange?.(query);
  };

  return (
    <>
      <Combobox as="div" value={selectedItem} onChange={handleChangeItem}>
        <Combobox.Label className="block text-sm font-medium leading-6 text-gray-900">
          Assigned to
        </Combobox.Label>
        <div className="relative mt-2">
          <Combobox.Input
            className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={(event) => handleQueryChange(event.target.value)}
            displayValue={(item: TItem) => item?.name}
            value={selectedItem?.name}
            name={selectedItem?.name}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>

          {filteredItems.length > 0 && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredItems.map((item) => (
                <Combobox.Option
                  key={item.id}
                  value={item}
                  className={({ active }) =>
                    classNames(
                      "relative cursor-default select-none py-2 pl-8 pr-4",
                      active ? "bg-indigo-600 text-white" : "text-gray-900"
                    )
                  }
                >
                  {({ active, selected }) => (
                    <>
                      <div className="flex items-center">
                        {item?.color ? (
                          <span
                            className={classNames(
                              "inline-block h-2 w-2 flex-shrink-0 rounded-full mr-2"
                            )}
                            style={{
                              backgroundColor: item.color,
                            }}
                            aria-hidden="true"
                          />
                        ) : null}

                        <span
                          className={classNames(
                            "truncate",
                            selected ? "font-semibold" : ""
                          )}
                        >
                          {item.name}
                        </span>
                      </div>

                      {selected && (
                        <span
                          className={classNames(
                            "absolute inset-y-0 left-0 flex items-center pl-1.5",
                            active ? "text-white" : "text-indigo-600"
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </>
  );
};
