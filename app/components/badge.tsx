export const Badge = ({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) => {
  const ColorDict = {
    red: "bg-red-100 text-red-800",
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
    pink: "bg-pink-100 text-pink-800",
    indigo: "bg-indigo-100 text-indigo-800",
    gray: "bg-gray-100 text-gray-800",
    night: "bg-night-100 text-night-800",
  };
  const colorClasses =
    ColorDict[color as keyof typeof ColorDict] || "bg-gray-100 text-gray-800";
  return (
    <span
      className={`${colorClasses} text-night-700 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10`}
    >
      {children}
    </span>
  );
};
