
-- drop all tables

DROP TABLE "public"."Tag" CASCADE;
DROP TABLE "public"."User" CASCADE;
DROP TABLE "public"."Location" CASCADE;
DROP TABLE "public"."AcitivityTag" CASCADE;
DROP TABLE "public"."Vacation" CASCADE;
DROP TABLE "public"."VacationActivity" CASCADE;
DROP TABLE "public"."Color" CASCADE;
DROP TABLE "public"."AcitivityDescription" CASCADE;
DROP TABLE "public"."DefaultVacationActivity" CASCADE;
DROP TABLE "public"."VacationDescription" CASCADE;


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
    "name" text  NOT NULL UNIQUE,
    "description" text,
    "fixed_hour" integer NULL,
    "fixed_minute" integer NULL,
    "fixed_day" integer NULL,
    PRIMARY KEY ("id")
);


CREATE TABLE "public"."User" (
    "id" SERIAL,
    -- -make email unique
    "email" text  NOT NULL UNIQUE,
    "password" text  NOT NULL ,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."Location" (
    "id" SERIAL,
    "name" text  NOT NULL UNIQUE,
    "description" text,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."AcitivityTag" (
    "id" SERIAL,
    "tagId" integer  NOT NULL ,
    "activityDescriptionId" integer  NOT NULL ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("activityDescriptionId") REFERENCES "public"."AcitivityDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- table VacationDescription 
CREATE TABLE "public"."VacationDescription" (
    "id" SERIAL,
    "name" text  NOT NULL UNIQUE,
    "description" text   ,
    PRIMARY KEY ("id"),
    "locationId" integer  NOT NULL ,
    FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE CASCADE ON UPDATE CASCADE
    
);

CREATE TABLE "public"."Vacation" (
    "id" SERIAL,
    "userId" integer  NOT NULL ,
    "startDate" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vacationDescriptionId" integer  NOT NULL ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("vacationDescriptionId") REFERENCES "public"."VacationDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."VacationActivity" (
    "id" SERIAL,
    "vacationId" integer  NOT NULL ,
    -- "activityBookingId" integer  NOT NULL ,
    "datetime" timestamp(3)  NULL ,
    "activityDescriptionId" integer NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("vacationId") REFERENCES "public"."Vacation"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("activityDescriptionId") REFERENCES "public"."AcitivityDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Tag.label_colorId" ON "public"."Tag"("label","colorId");

-- create table DefaultVacationActivity
CREATE TABLE "public"."DefaultVacationActivity" (
    "id" SERIAL,
    "vacationDescriptionId" integer  NOT NULL ,
    "activityDescriptionId" integer  NOT NULL ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("vacationDescriptionId") REFERENCES "public"."VacationDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("activityDescriptionId") REFERENCES "public"."AcitivityDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE
);


INSERT INTO "public"."Color" ("name") VALUES ('blue');
INSERT INTO "public"."Color" ("name") VALUES ('red');
INSERT INTO "public"."Color" ("name") VALUES ('green');
INSERT INTO "public"."Color" ("name") VALUES ('yellow');

INSERT INTO "public"."Tag" ("label", "colorId") VALUES ('Beach', 1);
INSERT INTO "public"."Tag" ("label", "colorId") VALUES ('City', 2);
INSERT INTO "public"."Tag" ("label", "colorId") VALUES ('Nature', 3);
INSERT INTO "public"."Tag" ("label", "colorId") VALUES ('Culture', 4);

INSERT INTO "public"."User" ("email", "password") VALUES ('admin@admin.de', '$2a$10$eCpSPy/E9R5yMBgrmERfN.9ywbnFkexKMfLgHwWscfsVC92R7.mq2');

INSERT INTO "public"."Location" ("name", "description") VALUES ('Berlin', 'Capital of Germany');
INSERT INTO "public"."Location" ("name", "description") VALUES ('Hamburg', 'City in the north of Germany');
INSERT INTO "public"."Location" ("name", "description") VALUES ('Munich', 'City in the south of Germany');
INSERT INTO "public"."Location" ("name", "description") VALUES ('Cologne', 'City in the west of Germany');
INSERT INTO "public"."Location" ("name", "description") VALUES ('Tenrife', 'Island in the south of Spain');


INSERT INTO "public"."AcitivityDescription" ("name", "description") VALUES ('Personal Training', 'Personal Training with a trainer');
INSERT INTO "public"."AcitivityDescription" ("name", "description") VALUES ('Sightseeing', 'Sightseeing in the city');
INSERT INTO "public"."AcitivityDescription" ("name", "description") VALUES ('Yoga Session', 'Yoga Session with a trainer');
INSERT INTO "public"."AcitivityDescription" ("name", "description", "fixed_hour", "fixed_minute", "fixed_day") VALUES ('Hike the Teide', 'Hike the Teide with a guide', 16, 30, 4);
INSERT INTO "public"."AcitivityDescription" ("name", "description") VALUES ('Visit the Cathedral', 'Visit the Cathedral with a guide');

INSERT INTO "public"."VacationDescription" ("name", "description", "locationId") VALUES ('Tenerife', 'Tenerife is the largest and most populated island of the eight Canary Islands. It is also the most populated island of Spain, with a land area of 2,034.38 square kilometres (785 sq mi) and 917,841 inhabitants at the start of 2019, 43 percent of the total population of the Canary Islands.', 5);

INSERT INTO "public"."Vacation" ("userId", "startDate", "endDate", "vacationDescriptionId") VALUES (1, '2023-07-09T08:53:23.808Z', '2023-07-16T08:53:23.809Z', 1);

INSERT INTO "public"."AcitivityTag" ("tagId", "activityDescriptionId") VALUES (1, 1);
INSERT INTO "public"."AcitivityTag" ("tagId", "activityDescriptionId") VALUES (2, 2);
INSERT INTO "public"."AcitivityTag" ("tagId", "activityDescriptionId") VALUES (3, 3);
INSERT INTO "public"."AcitivityTag" ("tagId", "activityDescriptionId") VALUES (4, 4);
INSERT INTO "public"."AcitivityTag" ("tagId", "activityDescriptionId") VALUES (4, 5);


INSERT INTO "public"."VacationActivity" ("vacationId", "activityDescriptionId", "datetime") VALUES (1, 1, '2023-07-09T08:53:23.808Z');
INSERT INTO "public"."VacationActivity" ("vacationId", "activityDescriptionId") VALUES (1, 2);
INSERT INTO "public"."VacationActivity" ("vacationId", "activityDescriptionId") VALUES (1, 3);
INSERT INTO "public"."VacationActivity" ("vacationId", "activityDescriptionId", "datetime") VALUES (1, 4, '2023-07-09T08:53:23.808Z');


-- insert into default -> tenerife has default 2 crossfit sessions
INSERT INTO "public"."DefaultVacationActivity" ("vacationDescriptionId", "activityDescriptionId") VALUES (1, 1);