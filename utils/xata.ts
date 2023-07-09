// Generated by Xata Codegen 0.23.5. Please do not edit.
import { buildClient } from "@xata.io/client";
import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "@xata.io/client";

const tables = [
  {
    name: "Tag",
    columns: [
      { name: "label", type: "string", unique: true },
      { name: "color", type: "link", link: { table: "Color" } },
    ],
  },
  {
    name: "User",
    columns: [
      { name: "email", type: "email", unique: true },
      { name: "password", type: "string" },
    ],
  },
  {
    name: "Location",
    columns: [
      { name: "name", type: "string", unique: true },
      { name: "description", type: "string" },
    ],
  },
  {
    name: "ActivityBooking",
    columns: [
      { name: "datetime", type: "datetime" },
      {
        name: "isFixedDate",
        type: "bool",
        notNull: true,
        defaultValue: "false",
      },
      {
        name: "activity",
        type: "link",
        link: { table: "AcitivityDescription" },
      },
    ],
  },
  {
    name: "AcivityTag",
    columns: [
      { name: "tag", type: "link", link: { table: "Tag" } },
      { name: "activity", type: "link", link: { table: "ActivityBooking" } },
    ],
  },
  {
    name: "Vacation",
    columns: [
      {
        name: "name",
        type: "string",
        notNull: true,
        defaultValue: "My Vacation",
      },
      { name: "user", type: "link", link: { table: "User" } },
      {
        name: "startDate",
        type: "datetime",
        notNull: true,
        defaultValue: "now",
      },
      { name: "endDate", type: "datetime", notNull: true, defaultValue: "now" },
      { name: "description", type: "text" },
      { name: "location", type: "link", link: { table: "Location" } },
    ],
  },
  {
    name: "VacationActivity",
    columns: [
      { name: "vacation", type: "link", link: { table: "Vacation" } },
      { name: "activity", type: "link", link: { table: "ActivityBooking" } },
    ],
  },
  { name: "Color", columns: [{ name: "name", type: "string", unique: true }] },
  {
    name: "AcitivityDescription",
    columns: [
      { name: "name", type: "string", unique: true },
      { name: "description", type: "string" },
    ],
  },
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type Tag = InferredTypes["Tag"];
export type TagRecord = Tag & XataRecord;

export type User = InferredTypes["User"];
export type UserRecord = User & XataRecord;

export type Location = InferredTypes["Location"];
export type LocationRecord = Location & XataRecord;

export type ActivityBooking = InferredTypes["ActivityBooking"];
export type ActivityBookingRecord = ActivityBooking & XataRecord;

export type AcivityTag = InferredTypes["AcivityTag"];
export type AcivityTagRecord = AcivityTag & XataRecord;

export type Vacation = InferredTypes["Vacation"];
export type VacationRecord = Vacation & XataRecord;

export type VacationActivity = InferredTypes["VacationActivity"];
export type VacationActivityRecord = VacationActivity & XataRecord;

export type Color = InferredTypes["Color"];
export type ColorRecord = Color & XataRecord;

export type AcitivityDescription = InferredTypes["AcitivityDescription"];
export type AcitivityDescriptionRecord = AcitivityDescription & XataRecord;

export type DatabaseSchema = {
  Tag: TagRecord;
  User: UserRecord;
  Location: LocationRecord;
  ActivityBooking: ActivityBookingRecord;
  AcivityTag: AcivityTagRecord;
  Vacation: VacationRecord;
  VacationActivity: VacationActivityRecord;
  Color: ColorRecord;
  AcitivityDescription: AcitivityDescriptionRecord;
};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL:
    "https://Jannik-Wienecke-s-workspace-hebkta.eu-west-1.xata.sh/db/reiseathleten",
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

let has = false;
export const getXataClient = () => {
  if (has && instance) {
    return instance;
  }

  if (instance) {
    console.log("HAS INSTANCE BBUT NOT HAS");
  }

  has = true;
  console.log("instance", Boolean(instance));

  console.log("get new instance");

  instance = new XataClient({});
  console.log("return ");

  return instance;
};
