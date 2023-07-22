import { Listbox, Transition } from "@headlessui/react";
import {
  FireIcon,
  HeartIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  HandThumbUpIcon,
  //   PaperClipIcon,
  XMarkIcon as XMarkIconMini,
} from "@heroicons/react/20/solid";
import { Form } from "@remix-run/react";
import clsx from "clsx";
import React, { Fragment } from "react";
import { classNames } from "~/utils/helper";

export const MOODS = [
  {
    name: "Excited",
    value: "excited",
    icon: FireIcon,
    iconColor: "text-white",
    bgColor: "bg-red-500",
  },
  {
    name: "Loved",
    value: "loved",
    icon: HeartIcon,
    iconColor: "text-white",
    bgColor: "bg-pink-400",
  },
  {
    name: "Happy",
    value: "happy",
    icon: FaceSmileIcon,
    iconColor: "text-white",
    bgColor: "bg-green-400",
  },
  {
    name: "Sad",
    value: "sad",
    icon: FaceFrownIcon,
    iconColor: "text-white",
    bgColor: "bg-yellow-400",
  },
  {
    name: "Thumbsy",
    value: "thumbsy",
    icon: HandThumbUpIcon,
    iconColor: "text-white",
    bgColor: "bg-blue-500",
  },
  {
    name: "I feel nothing",
    value: null,
    icon: XMarkIconMini,
    iconColor: "text-gray-400",
    bgColor: "bg-transparent",
  },
];

export const CommentForm = () => {
  const [selected, setSelected] = React.useState(MOODS[5]);

  const [text, setText] = React.useState("");

  return (
    <>
      {/* New comment form */}
      <div className="mt-6 flex gap-x-3">
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt=""
          className="h-6 w-6 flex-none rounded-full bg-gray-50"
        />
        <Form method="POST" className="relative flex-auto">
          <div className="overflow-hidden rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
            <label htmlFor="comment" className="sr-only">
              Add your comment
            </label>

            <input type="hidden" name="action" value={"comment"} />

            <input type="hidden" name="mood" value={selected.value || ""} />

            <textarea
              rows={2}
              name="comment"
              id="comment"
              className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder="Add your comment..."
              defaultValue={""}
              minLength={2}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
            <MoodPicker selected={selected} setSelected={setSelected} />

            <button
              disabled={text.length < 2}
              type="submit"
              className={clsx(
                "rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Comment
            </button>
          </div>
        </Form>
      </div>
    </>
  );
};

const MoodPicker = ({
  selected,
  setSelected,
}: {
  selected: typeof MOODS[0];
  setSelected: React.Dispatch<React.SetStateAction<typeof MOODS[0]>>;
}) => {
  return (
    <div className="flex items-center space-x-5">
      <div className="flex items-center">
        <Listbox value={selected} onChange={setSelected}>
          {({ open }) => (
            <>
              <Listbox.Label className="sr-only">Your mood</Listbox.Label>
              <div className="relative">
                <Listbox.Button className="relative -m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                  <span className="flex items-center justify-center">
                    {selected.value === null ? (
                      <span>
                        <FaceSmileIcon
                          className="h-5 w-5 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span className="sr-only">Add your mood</span>
                      </span>
                    ) : (
                      <span>
                        <span
                          className={classNames(
                            selected.bgColor,
                            "flex h-8 w-8 items-center justify-center rounded-full"
                          )}
                        >
                          <selected.icon
                            className="h-5 w-5 flex-shrink-0 text-white"
                            aria-hidden="true"
                          />
                        </span>
                        <span className="sr-only">{selected.name}</span>
                      </span>
                    )}
                  </span>
                </Listbox.Button>

                <Transition
                  show={open}
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 -ml-6 mt-1 w-60 rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:ml-auto sm:w-64 sm:text-sm">
                    {MOODS.map((mood) => (
                      <Listbox.Option
                        key={mood.value}
                        className={({ active }) =>
                          classNames(
                            active ? "bg-gray-100" : "bg-white",
                            "relative cursor-default select-none px-3 py-2"
                          )
                        }
                        value={mood}
                      >
                        <div className="flex items-center">
                          <div
                            className={classNames(
                              mood.bgColor,
                              "flex h-8 w-8 items-center justify-center rounded-full"
                            )}
                          >
                            <mood.icon
                              className={classNames(
                                mood.iconColor,
                                "h-5 w-5 flex-shrink-0"
                              )}
                              aria-hidden="true"
                            />
                          </div>
                          <span className="ml-3 block truncate font-medium">
                            {mood.name}
                          </span>
                        </div>
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </>
          )}
        </Listbox>
      </div>
    </div>
  );
};
