import { Transition, Dialog, Combobox } from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  FolderIcon,
  PlusIcon,
  TagIcon,
} from "@heroicons/react/20/solid";
import React from "react";
import { Fragment, useRef, useState } from "react";
import { classNames } from "~/utils/helper";
import { type Tag } from "~/utils/lib/types";
import { TagItem } from "./tag-item";
const CommandbarBase = ({
  onClose,
  isOpen,
  afterLeave,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  afterLeave?: () => void;
  children: React.ReactNode;
}) => {
  return (
    <Transition.Root show={isOpen} as={Fragment} afterLeave={afterLeave} appear>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export interface ComboboxShortcut {
  label: string;
  id: number;
  shortcut?: string;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
}

export interface ComboboxItem {
  label: string;
  id: number;
}

const ComboboxBase = <T extends ComboboxItem>({
  items,
  onSelect,
  recent = [],
  quickActions,
}: {
  items: T[];
  quickActions: ComboboxShortcut[];
  recent?: T[];
  onSelect: (item: ComboboxItem) => void;
}) => {
  const [query, setQuery] = useState("");

  const filteredItems =
    query === ""
      ? []
      : items.filter((item) => {
          return item.label.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox onChange={(v: T) => onSelect(v)}>
      <div className="relative">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-900 text-opacity-40"
          aria-hidden="true"
        />
        <Combobox.Input
          className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 focus:ring-0 sm:text-sm"
          placeholder="Search..."
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {(query === "" || filteredItems.length > 0) && (
        <Combobox.Options
          static
          className="max-h-80 scroll-py-2 divide-y divide-gray-500 divide-opacity-10 overflow-y-auto"
        >
          <li className="p-2">
            {query === "" && (
              <h2 className="mb-2 mt-4 px-3 text-xs font-semibold text-gray-900">
                Recent searches
              </h2>
            )}
            <ul className="text-sm text-gray-700">
              {(query === "" ? recent : filteredItems).map((item) => (
                <Combobox.Option
                  key={item.id}
                  value={item}
                  className={({ active }) =>
                    classNames(
                      "flex cursor-default select-none items-center rounded-md px-3 py-2",
                      active ? "bg-gray-900 bg-opacity-5 text-gray-900" : ""
                    )
                  }
                >
                  {({ active }) => (
                    <>
                      <FolderIcon
                        className={classNames(
                          "h-6 w-6 flex-none text-gray-900 text-opacity-40",
                          active ? "text-opacity-100" : ""
                        )}
                        aria-hidden="true"
                      />
                      <span className="ml-3 flex-auto truncate">
                        {item.label}
                      </span>
                      {active && (
                        <span className="ml-3 flex-none text-gray-500">
                          Select...
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </ul>
          </li>
          {query === "" && (
            <li className="p-2">
              <h2 className="sr-only">Quick actions</h2>
              <ul className="text-sm text-gray-700">
                {quickActions.map((action) => (
                  <Combobox.Option
                    key={action.shortcut}
                    value={action}
                    className={({ active }) =>
                      classNames(
                        "flex cursor-default select-none items-center rounded-md px-3 py-2",
                        active ? "bg-gray-900 bg-opacity-5 text-gray-900" : ""
                      )
                    }
                  >
                    {({ active }) => (
                      <>
                        <action.icon
                          className={classNames(
                            "h-6 w-6 flex-none text-gray-900 text-opacity-40",
                            active ? "text-opacity-100" : ""
                          )}
                          aria-hidden="true"
                        />
                        <span className="ml-3 flex-auto truncate">
                          {action.label}
                        </span>
                        <span className="ml-3 flex-none text-xs font-semibold text-gray-500">
                          <kbd className="font-sans">⌘</kbd>
                          <kbd className="font-sans">{action.shortcut}</kbd>
                        </span>
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </ul>
            </li>
          )}
        </Combobox.Options>
      )}

      {query !== "" && filteredItems.length === 0 && (
        <div className="px-6 py-14 text-center sm:px-14">
          <FolderIcon
            className="mx-auto h-6 w-6 text-gray-900 text-opacity-40"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm text-gray-900">
            We couldn't find any projects with that term. Please try again.
          </p>
        </div>
      )}
    </Combobox>
  );
};

const ComboboxTags = ({
  tags,
  selected: _selected,
  onChange,
}: {
  tags: Tag[];
  selected: Tag[];
  onChange: (selected: Tag[]) => void;
}) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Tag[]>(_selected);

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

  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current(selected);
  }, [selected]);

  const [color, setColor] = useState(getRandomColor);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
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
              {(query === "" ? tagsWithoutSelected : filteredProjects).map(
                (tag) => (
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
                )
              )}
            </ul>
          </li>
        </Combobox.Options>
      )}

      {query !== "" && filteredProjects.length === 0 && (
        <div
          role="button"
          onClick={() => handleAddTag({ label: query, color: "green" })}
          className="flex flex-row space-x-2 justify-start items-center p-4 bg-gray-200 cursor-pointer"
        >
          <PlusIcon className="h-6 w-6 text-gray-700" aria-hidden="true" />
          <div className="text-sm text-black flex flex-row space-x-2 items-center ">
            <p>Create Tag</p>
            <div className="relative">
              <TagItem label={query} color={`#${color}`} />
            </div>
          </div>
        </div>
      )}
    </Combobox>
  );
};

export const Commandbar = {
  Base: CommandbarBase,
  Combobox: ComboboxBase,
  Tags: ComboboxTags,
};

const getRandomColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return randomColor;
};
