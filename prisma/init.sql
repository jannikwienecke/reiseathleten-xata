CREATE TABLE "public"."Color" (
    "id" SERIAL,
    "name" text  NOT NULL ,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."Tag" (
    "id" SERIAL,
    "label" text  NOT NULL ,
    "colorId" integer  NOT NULL ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("colorId") REFERENCES "public"."Color"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."AcitivityDescription" (
    "id" SERIAL,
    "name" text  NOT NULL ,
    "description" text   ,
    PRIMARY KEY ("id")
);


CREATE TABLE "public"."User" (
    "id" SERIAL,
    "email" text  NOT NULL ,
    "password" text  NOT NULL ,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."Location" (
    "id" SERIAL,
    "name" text  NOT NULL,
    "description" text,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."ActivityBooking" (
    "id" SERIAL,
    "datetime" timestamp(3),
    "isFixedDate" boolean  NOT NULL DEFAULT false,
    "acitivityDescriptionId" integer  NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("acitivityDescriptionId") REFERENCES "public"."AcitivityDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."AcitivityTag" (
    "id" SERIAL,
    "tagId" integer  NOT NULL ,
    "activityBookingId" integer  NOT NULL ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("activityBookingId") REFERENCES "public"."ActivityBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."Vacation" (
    "id" SERIAL,
    "name" text  NOT NULL DEFAULT 'My Vacation',
    "userId" integer  NOT NULL ,
    "startDate" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" text   ,
    "locationId" integer  NOT NULL ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."VacationActivity" (
    "id" SERIAL,
    "vacationId" integer  NOT NULL ,
    "activityBookingId" integer  NOT NULL ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("vacationId") REFERENCES "public"."Vacation"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("activityBookingId") REFERENCES "public"."ActivityBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Tag.label_colorId" ON "public"."Tag"("label","colorId");


-- drop all tables

DROP TABLE "public"."Tag" CASCADE;
DROP TABLE "public"."User" CASCADE;
DROP TABLE "public"."Location" CASCADE;
DROP TABLE "public"."ActivityBooking" CASCADE;
DROP TABLE "public"."AcitivityTag" CASCADE;
DROP TABLE "public"."Vacation" CASCADE;
DROP TABLE "public"."VacationActivity" CASCADE;
DROP TABLE "public"."Color" CASCADE;
DROP TABLE "public"."AcitivityDescription" CASCADE;


INSERT INTO "public"."Color" ("name") VALUES ('blue');
INSERT INTO "public"."Color" ("name") VALUES ('red');
INSERT INTO "public"."Color" ("name") VALUES ('green');
INSERT INTO "public"."Color" ("name") VALUES ('yellow');

INSERT INTO "public"."Tag" ("label", "colorId") VALUES ('Beach', 1);
INSERT INTO "public"."Tag" ("label", "colorId") VALUES ('City', 2);
INSERT INTO "public"."Tag" ("label", "colorId") VALUES ('Nature', 3);
INSERT INTO "public"."Tag" ("label", "colorId") VALUES ('Culture', 4);

INSERT INTO "public"."User" ("email", "password") VALUES ('admin@admin.de', 'admin');

INSERT INTO "public"."Location" ("name", "description") VALUES ('Berlin', 'Capital of Germany');
INSERT INTO "public"."Location" ("name", "description") VALUES ('Hamburg', 'City in the north of Germany');
INSERT INTO "public"."Location" ("name", "description") VALUES ('Munich', 'City in the south of Germany');
INSERT INTO "public"."Location" ("name", "description") VALUES ('Cologne', 'City in the west of Germany');

INSERT INTO "public"."AcitivityDescription" ("name", "description") VALUES ('Personal Training', 'Personal Training with a trainer');
INSERT INTO "public"."AcitivityDescription" ("name", "description") VALUES ('Sightseeing', 'Sightseeing in the city');
INSERT INTO "public"."AcitivityDescription" ("name", "description") VALUES ('Yoga Session', 'Yoga Session with a trainer');
INSERT INTO "public"."AcitivityDescription" ("name", "description") VALUES ('Hike the Teide', 'Hike the Teide with a guide');
INSERT INTO "public"."AcitivityDescription" ("name", "description") VALUES ('Visit the Cathedral', 'Visit the Cathedral with a guide');

INSERT INTO "public"."ActivityBooking" ( "isFixedDate", "acitivityDescriptionId") VALUES (false, 1);
INSERT INTO "public"."ActivityBooking" ( "isFixedDate", "acitivityDescriptionId") VALUES (false, 2);
INSERT INTO "public"."ActivityBooking" ( "isFixedDate", "acitivityDescriptionId") VALUES (false, 3);
INSERT INTO "public"."ActivityBooking" ("datetime", "isFixedDate", "acitivityDescriptionId") VALUES ('2023-07-09T08:53:23.808Z', true, 4);
INSERT INTO "public"."ActivityBooking" ("datetime", "isFixedDate", "acitivityDescriptionId") VALUES ('2023-07-09T08:53:23.808Z', true, 5);

INSERT INTO "public"."ActivityBooking" ("isFixedDate", "acitivityDescriptionId") VALUES (false, 1);

INSERT INTO "public"."Vacation" ("name", "userId", "startDate", "endDate", "description", "locationId") VALUES ('My Vacation', 1, '2023-07-09T08:53:23.808Z', '2023-07-16T08:53:23.809Z', 'My Vacation Description', 1);

INSERT INTO "public"."AcitivityTag" ("tagId", "activityBookingId") VALUES (1, 1);
INSERT INTO "public"."AcitivityTag" ("tagId", "activityBookingId") VALUES (2, 2);
INSERT INTO "public"."AcitivityTag" ("tagId", "activityBookingId") VALUES (3, 3);
INSERT INTO "public"."AcitivityTag" ("tagId", "activityBookingId") VALUES (4, 4);
INSERT INTO "public"."AcitivityTag" ("tagId", "activityBookingId") VALUES (4, 5);


INSERT INTO "public"."VacationActivity" ("vacationId", "activityBookingId") VALUES (1, 1);
INSERT INTO "public"."VacationActivity" ("vacationId", "activityBookingId") VALUES (1, 2);
INSERT INTO "public"."VacationActivity" ("vacationId", "activityBookingId") VALUES (1, 3);
INSERT INTO "public"."VacationActivity" ("vacationId", "activityBookingId") VALUES (1, 4);
INSERT INTO "public"."VacationActivity" ("vacationId", "activityBookingId") VALUES (1, 5);

