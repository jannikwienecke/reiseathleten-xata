// const tables = [
//     {
//       name: "Tag",
//       columns: [
//         { name: "label", type: "string", unique: true },
//         { name: "color", type: "link", link: { table: "Color" } },
//       ],
//     },
//     {
//       name: "User",
//       columns: [
//         { name: "email", type: "email", unique: true },
//         { name: "password", type: "string" },
//       ],
//     },
//     {
//       name: "Location",
//       columns: [
//         { name: "name", type: "string", unique: true },
//         { name: "description", type: "string" },
//       ],
//     },
//     {
//       name: "Activity",
//       columns: [
//         { name: "datetime", type: "datetime" },
//         {
//           name: "isFixedDate",
//           type: "bool",
//           notNull: true,
//           defaultValue: "false",
//         },
//         { name: "description", type: "text" },
//         { name: "name", type: "string", notNull: true, defaultValue: "" },
//       ],
//     },
//     {
//       name: "AcivityTag",
//       columns: [
//         { name: "tag", type: "link", link: { table: "Tag" } },
//         { name: "activity", type: "link", link: { table: "Activity" } },
//       ],
//     },
//     {
//       name: "Vacation",
//       columns: [
//         {
//           name: "name",
//           type: "string",
//           notNull: true,
//           defaultValue: "My Vacation",
//         },
//         { name: "user", type: "link", link: { table: "User" } },
//         {
//           name: "startDate",
//           type: "datetime",
//           notNull: true,
//           defaultValue: "now",
//         },
//         { name: "endDate", type: "datetime", notNull: true, defaultValue: "now" },
//         { name: "description", type: "text" },
//         { name: "location", type: "link", link: { table: "Location" } },
//       ],
//     },
//     {
//       name: "VacationActivity",
//       columns: [
//         { name: "vacation", type: "link", link: { table: "Vacation" } },
//         { name: "activity", type: "link", link: { table: "Activity" } },
//       ],
//     },
//     { name: "Color", columns: [{ name: "name", type: "string", unique: true }] },
//   ] as const;

interface TagInterface {
  label: string;
  color: string;
}

export interface ActivityBookingInterface {
  datetime?: string;
  isFixedDate: boolean;
  description: string;
  name: string;
  id: string;
}

interface LocationInterface {
  name: string;
  description?: string;
}

interface VacationInterface {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface VacationDtoProps {
  vacation: VacationInterface;
  activities: ActivityBookingInterface[];
  location: LocationInterface;
  tags: TagInterface[];
}
