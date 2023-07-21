import { PhotoIcon } from "@heroicons/react/24/solid";
import {
  type FormProps,
  Form as RemixForm,
  useFetcher,
  useParams,
  useNavigation,
} from "@remix-run/react";
import React from "react";
import { type Color, ComboBox } from "./combobox";
import invariant from "tiny-invariant";

export const LibForm = ({
  title,
  children,
  onCancel,
  model,
}: {
  title: string;
  children: React.ReactNode;
  onCancel?: () => void;
  model?: string;
}) => {
  const { state } = useNavigation();

  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return (
    <Form
      onCancel={onCancel}
      title={title}
      method="POST"
      SaveButton={
        <Form.SaveButton
          label={state === "submitting" ? "Saving..." : "Save"}
          isLoading={state === "submitting"}
        />
      }
    >
      <input type="hidden" name="model" value={model} />
      {children}
    </Form>
  );
};

export function Form({
  title,
  children,
  description,
  SaveButton,
  onCancel,
  ...props
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  SaveButton?: React.ReactNode;
  onCancel?: () => void;
} & FormProps) {
  return (
    <div className="space-y-10 divide-y divide-gray-900/10 h-full ">
      <div className="flex flex-col gap-x-8 gap-y-6 h-full ">
        <div className="px-4 sm:px-0">
          <h2 className="text-xl font-bold text-black leading-9 tracking-wide">
            {title}
          </h2>
          <p className=" text-lg text-gray-700 leading-9">
            {description || "Update Model Information"}
          </p>
        </div>

        <RemixForm
          {...props}
          method="POST"
          className="sm:rounded-xl md:col-span-2 flex flex-col flex-1 "
        >
          <div className="px-2 py-6 max-w-2xl gap-x-6 gap-y-8 flex flex-col flex-1">
            {children}
          </div>

          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
            <button
              onClick={onCancel}
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Cancel
            </button>

            {SaveButton}
          </div>
        </RemixForm>
      </div>
    </div>
  );
}

const DefaultInput = ({
  label,
  ...props
}: {
  label?: string;
  name: string;
  error?: string;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) => {
  return (
    <div className={`${props.hidden ? "hidden" : ""}`}>
      {label ? (
        <label
          htmlFor="first-name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {label}
        </label>
      ) : null}
      <div className={`mt-2 ${props.type === "checkbox" && "h-8"}`}>
        {props.type === "textarea" ? (
          <>
            <textarea
              {...props}
              rows={10}
              defaultValue={props.value}
              value={undefined}
              className={`h-full ${
                props.error ? "focus:ring-red-600" : "focus:ring-indigo-600"
              } block w-full pl-4 rounded-md border-[1px] py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm sm:leading-6 ${
                props.hidden ? "hidden" : ""
              } ${props.error ? "border-red-600 border-[1px]" : ""}}`}
            />
          </>
        ) : (
          <>
            <input
              {...props}
              defaultValue={props.value}
              value={undefined}
              className={`h-full ${
                props.error ? "focus:ring-red-600" : "focus:ring-indigo-600"
              } block w-full pl-4 rounded-md border-[1px] py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm sm:leading-6 ${
                props.hidden ? "hidden" : ""
              } ${props.error ? "border-red-600 border-[1px]" : ""}}`}
            />
          </>
        )}
      </div>

      {props.error ? (
        <p className="mt-2 text-sm text-red-600" id="email-error">
          {props.error}
        </p>
      ) : null}
    </div>
  );
};

const ImageInput = () => {
  return (
    <div className="col-span-full">
      <label
        htmlFor="cover-photo"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Cover photo
      </label>
      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
        <div className="text-center">
          <PhotoIcon
            className="mx-auto h-12 w-12 text-gray-300"
            aria-hidden="true"
          />
          <div className="mt-4 flex text-sm leading-6 text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs leading-5 text-gray-600">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      </div>
    </div>
  );
};

const SaveButton = ({
  label,
  isLoading,
}: {
  isLoading?: boolean;
  label: string;
}) => {
  return (
    <button
      type="submit"
      className="rounded-md bg-black items-center flex flex-row gap-2 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      {isLoading ? (
        <div
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      ) : null}

      {label}
    </button>
  );
};
export interface ISelectOption {
  id: number | string;
  name: string;
  color?: Color;
}

const Select = ({
  name,
  onSelect,
  value,
  selectId,
  label,
}: {
  name: string;
  value: any;
  selectId?: string | number;
  label?: string;

  onSelect: (item: ISelectOption) => void;
}) => {
  const fetcher = useFetcher();
  const { model } = useParams();

  invariant(model, "model is required");

  const [selected, setSelected] = React.useState<ISelectOption | null>(
    value && selectId
      ? {
          id: selectId,
          name: value,
          color: value,
        }
      : null
  );

  const handleSelect = (item: { id: number | string; name: string }) => {
    setSelected(item);
  };

  const fetchPeople = (query: string) => {
    fetcher.submit(
      { query, name, model },
      { method: "get", action: "/api/options" }
    );
  };

  const timeoutRef = React.useRef<number | null>(null);
  const handleQueryChange = (query: string) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      fetchPeople(query);
      clearTimeout(timeoutRef.current!);
    }, 300);
  };

  const fetchRef = React.useRef(fetchPeople);
  React.useEffect(() => {
    fetchRef.current("");
  }, []);

  return (
    <div className="mt-1 relative">
      <>
        <input name={name} type="hidden" value={selected?.id} />
      </>

      <ComboBox
        defaultItem={
          selected
            ? {
                ...selected,
                name: selected?.name || "red",
                color: (selected?.name as Color) || "red",
              }
            : undefined
        }
        label={label || name}
        items={fetcher.data?.items ? fetcher.data?.items || [] : []}
        onSelect={handleSelect}
        onQueryChange={handleQueryChange}
      />
    </div>
  );
};

Form.ImageInput = ImageInput;
Form.DefaultInput = DefaultInput;
Form.SaveButton = SaveButton;
Form.Select = Select;
