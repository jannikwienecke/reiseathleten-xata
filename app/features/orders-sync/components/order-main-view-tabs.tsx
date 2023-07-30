import { useSearchParams } from "@remix-run/react";
import clsx from "clsx";

type ViewType = {
  name: string;
  label: string;
};

export function DetailsTabs({
  views,
}: {
  views: {
    name: string;
    label: string;
  }[];
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleChangeTab = (tab: ViewType) => {
    searchParams.set("view", tab.name);
    setSearchParams(searchParams);
  };

  const currentTab = views.find((tab) => tab.name === searchParams.get("view"));

  return (
    <div className="w-1/2">
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select View
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-black focus:ring-black"
          // defaultValue={views.find((tab) => tab?.current)?.name}
        >
          {views.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <nav
          className="isolate flex divide-x divide-gray-200 rounded-lg shadow"
          aria-label="Tabs"
        >
          {views.map((tab, tabIdx) => {
            const isCurrent = currentTab
              ? tab.name === currentTab?.name
              : tabIdx === 0;
            return (
              <button
                key={tab.name}
                onClick={() => handleChangeTab(tab)}
                className={clsx(
                  isCurrent
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700",
                  tabIdx === 0 ? "rounded-l-lg" : "",
                  tabIdx === views.length - 1 ? "rounded-r-lg" : "",
                  "group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10"
                )}
                aria-current={isCurrent ? "page" : undefined}
              >
                <span>{tab.label}</span>
                <span
                  aria-hidden="true"
                  className={clsx(
                    isCurrent ? "bg-black" : "bg-transparent",
                    "absolute inset-x-0 bottom-0 h-0.5"
                  )}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
