import { XMarkIcon } from "@heroicons/react/20/solid";

export const TagItem = ({
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
