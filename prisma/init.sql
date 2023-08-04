
-- drop all tables

DROP TABLE "public"."Tag" CASCADE;
DROP TABLE "public"."User" CASCADE;
DROP TABLE "public"."Location" CASCADE;
DROP TABLE "public"."AcitivityTag" CASCADE;
DROP TABLE "public"."OrderActivity" CASCADE;
DROP TABLE "public"."Color" CASCADE;
DROP TABLE "public"."AcitivityDescription" CASCADE;
DROP TABLE "public"."DefaultVacationActivity" CASCADE;
DROP TABLE "public"."VacationDescription" CASCADE;
DROP TABLE "public"."Customer" CASCADE;
DROP TABLE "public"."Service" CASCADE;
DROP TABLE "public"."VacationServices" CASCADE;
DROP TABLE "public"."Order" CASCADE;
DROP TABLE "public"."OrderActivityEvents" CASCADE;
DROP TABLE "public"."Hotel" CASCADE;
DROP TABLE "public"."Room" CASCADE;
DROP TABLE "public"."Contact" CASCADE;

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

CREATE TABLE "public"."Customer" (
    "id" SERIAL,
    "first_name" text  NOT NULL ,
    "last_name" text  NOT NULL ,
    "company" text  NOT NULL ,
    "address_1" text  NOT NULL ,
    "address_2" text  NOT NULL ,
    "email" text  NOT NULL UNIQUE,
    "city" text  NOT NULL ,
    "state" text  NOT NULL ,
    "postcode" text  NOT NULL ,
    "country" text  NOT NULL ,
    "phone" text  NOT NULL ,
    "title" text  NOT NULL ,
    "title_formatted" text  NOT NULL ,
    "shipping_address" text  NOT NULL ,
    "birth_date" text NOT NULL DEFAULT '',
    "user_id" integer  NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."Contact" (
    "id" SERIAL,
    "first_name" text  NOT NULL ,
    "last_name" text  NOT NULL ,
    "company" text  NOT NULL ,
    "address_1" text   NULL ,
    "address_2" text   NULL ,
    "email" text  NOT NULL UNIQUE,
    "city" text   NULL ,
    "state" text   NULL ,
    "postcode" text   NULL ,
    "phone" text  NOT NULL ,
    PRIMARY KEY ("id")
);
-- make company, address_1, address_2, city, state, postcode nullable
ALTER TABLE "public"."Contact" ALTER COLUMN "company" DROP NOT NULL;
ALTER TABLE "public"."Contact" ALTER COLUMN "address_1" DROP NOT NULL;
ALTER TABLE "public"."Contact" ALTER COLUMN "address_2" DROP NOT NULL;
ALTER TABLE "public"."Contact" ALTER COLUMN "city" DROP NOT NULL;
ALTER TABLE "public"."Contact" ALTER COLUMN "state" DROP NOT NULL;
ALTER TABLE "public"."Contact" ALTER COLUMN "postcode" DROP NOT NULL;



CREATE TABLE "public"."Location" (
    "id" SERIAL,
    "name" text  NOT NULL UNIQUE,
    "description" text,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."Room" (
    "id" SERIAL,
    "name" text  NOT NULL  ,
    PRIMARY KEY ("id")

);

CREATE TABLE "public"."Hotel" (
    "id" SERIAL,
    "name" text  NOT NULL,
    "locationId" integer  NULL,
    "contactId" integer NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON UPDATE CASCADE,
    FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON UPDATE CASCADE
);

CREATE TABLE "public"."VacationHotel"(
    "id" SERIAL,
    "vacation_id" integer  NOT NULL ,
    "hotel_id" integer  NOT NULL ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("vacation_id") REFERENCES "public"."VacationDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("hotel_id") REFERENCES "public"."Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- table VacationRoom
CREATE TABLE "public"."VacationRoom"(
    "id" SERIAL,
    "vacation_id" integer  NOT NULL ,
    "room_id" integer  NOT NULL ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("vacation_id") REFERENCES "public"."VacationDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("room_id") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE
);



CREATE TABLE "public"."AcitivityTag" (
    "id" SERIAL,
    "tagId" integer  NOT NULL ,
    "activityDescriptionId" integer  NOT NULL ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("activityDescriptionId") REFERENCES "public"."AcitivityDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- product === vacationDescription
CREATE TABLE "public"."VacationDescription" (
    "id" SERIAL,
    "name" text  NOT NULL,
    "description" text,
    "image_url" text,
    "slug" text,
    "permalink" text,
    "date_created" text,
    "date_created_gmt" text,
    "date_modified" text,
    "date_modified_gmt" text,
    "type" text,
    "status" text,
    "price" text,
    "is_parent" boolean NOT NULL DEFAULT false,
    -- "parent_id" integer NULL,

    PRIMARY KEY ("id"),
    "locationId" integer  NULL,
    FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON UPDATE CASCADE
    -- FOREIGN KEY ("parent_id") REFERENCES "public"."VacationDescription"("id") ON UPDATE CASCADE 
);

-- alter table -> add date_imported
ALTER TABLE "public"."VacationDescription" ADD COLUMN "date_imported" text NOT NULL DEFAULT '';
ALTER TABLE "public"."VacationDescription" DROP CONSTRAINT "VacationDescription_name_key";
ALTER TABLE "public"."VacationDescription" ADD COLUMN "is_parent" boolean NOT NULL DEFAULT false;
ALTER TABLE "public"."VacationDescription" ADD COLUMN "parent_id" integer NULL;
ALTER TABLE "public"."VacationDescription" ADD FOREIGN KEY ("parent_id") REFERENCES "public"."VacationDescription"("id") ON UPDATE CASCADE;

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



CREATE TABLE "public"."Service" (
    "id" SERIAL,
    "name" text  NOT NULL ,
    "description" text  NOT NULL DEFAULT '',
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."VacationServices" (
    "id" SERIAL,
    "vacation_id" integer  NOT NULL ,
    "service_id" integer  NOT NULL ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("vacation_id") REFERENCES "public"."VacationDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("service_id") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE "public"."Order" (
    -- ORDER OVERVIEW
    "id" integer NOT NULL UNIQUE,
    "order_key" text  NOT NULL,
    "date_created" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_imported" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- use the price from the line item  
    "price" DECIMAL  NOT NULL,

    -- Order Description
    "vacation_id" integer  NOT NULL ,
    "start_date" DATE  NOT NULL ,
    "end_date" DATE  NOT NULL ,
    "duration" integer  NOT NULL ,
    "persons" integer  NOT NULL ,
    "room_description" text  NOT NULL,
    -- must be linked to a many to many table vacation_services
    -- "additional_services" text  NOT NULL,

    -- PAYMENT
    "payment_method" text  NOT NULL ,
    "payment_method_title" text  NOT NULL ,
    "add_to_community" text  NOT NULL DEFAULT '',

    -- META
    "knowledge_from" text  NOT NULL,
    "crossfit_box" text,

    -- status
    "status" text  NOT NULL DEFAULT 'pending',

    -- additonal services (json)
    "additional_services" text  NOT NULL DEFAULT '',

-- the order id which can be in multiple lines
    order_id integer  NOT NULL,

    hotel_id integer;
    room_id integer;

    -- user
    "user_id" integer  NOT NULL ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("vacation_id") REFERENCES "public"."VacationDescription"("id") ON UPDATE CASCADE,
    FOREIGN KEY ("hotel_id") REFERENCES "public"."Hotel"("id") ON UPDATE CASCADE,
    FOREIGN KEY ("room_id") REFERENCES "public"."Room"("id") ON UPDATE CASCADE
);

-- ALTER -> add room and hotel
-- ALTER TABLE "public"."Order" ADD COLUMN "hotel_id" integer;
-- ALTER TABLE "public"."Order" ADD COLUMN "room_id" integer;
-- ALTER TABLE "public"."Order" ADD FOREIGN KEY ("hotel_id") REFERENCES "public"."Hotel"("id") ON UPDATE CASCADE;
-- ALTER TABLE "public"."Order" ADD FOREIGN KEY ("room_id") REFERENCES "public"."Room"("id") ON UPDATE CASCADE;


CREATE TABLE "public"."OrderActivityEvents" (
    "id" SERIAL,
    "content" text  NOT NULL DEFAULT '',
    "mood" text  NOT NULL DEFAULT '',
    "date" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" text  NOT NULL DEFAULT '',
    "order_id" integer  NOT NULL ,
    "user_id" integer  NOT NULL ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("order_id") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE "public"."OrderActivity" (
    "id" SERIAL,
    "order_id" integer  NOT NULL ,
    "datetime" timestamp(3)  NULL ,
    "activityDescriptionId" integer NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("activityDescriptionId") REFERENCES "public"."AcitivityDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("order_id") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
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
INSERT INTO "public"."User" ("email", "password") VALUES ('max@mustermann.de', '$2a$10$eCpSPy/E9R5yMBgrmERfN.9ywbnFkexKMfLgHwWscfsVC92R7.mq2');

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

INSERT INTO "public"."VacationDescription" ("name", "description", "locationId") VALUES ('TenerifeOld', 'Tenerife is the largest and most populated island of the eight Canary Islands. It is also the most populated island of Spain, with a land area of 2,034.38 square kilometres (785 sq mi) and 917,841 inhabitants at the start of 2019, 43 percent of the total population of the Canary Islands.', 5);
INSERT INTO "public"."VacationDescription" ("id", "name", "description", "locationId") VALUES (24875,'CrossFit 27 Basispaket an der Costa Adeje - Fitnessurlaub auf Teneriffa (Spanien)', 'Tenerife is the largest and most populated island of the eight Canary Islands. It is also the most populated island of Spain, with a land area of 2,034.38 square kilometres (785 sq mi) and 917,841 inhabitants at the start of 2019, 43 percent of the total population of the Canary Islands.', 5);
INSERT INTO "public"."VacationDescription" ("id", "name", "description", "image_url", "slug", "permalink", "date_created", "date_created_gmt", "date_modified", "date_modified_gmt", "type", "status", "price", "locationId") VALUES (70050, 'CrossFit, Hyrox & Mehr auf Mallorca - Top CrossFit Box & Wellness-Hotel am Traumstrand von Santa Ponsa', '<p><strong><span style="color: #339966;">✓ alle Reiseathleten Vorteile (u.a. flexible Umbuchung, deutschsprachige Betreuung)</span></strong></p>\n<p>&nbsp;</p>\n<hr />\n<p style="text-align: justify;"><span style="font-weight: 400; font-size: 14pt;"><strong>Inbegriffen sind u. a. folgende Leistungen:</strong></span></p>\n<p style="text-align: left;"><span style="color: #1e73be;"><span style="font-weight: 400;"><span style="color: #008000; font-family: Georgia, Palatino; font-size: 12pt;"><span style="color: #000000; font-family: Georgia, Palatino; font-size: 12pt;"><span style="color: #000000;"><strong>• Unterkunft</strong>: * * * * Reverence Life Hotel in Santa Ponsa, Mallorca<br />\n</span></span></span></span></span><span style="color: #1e73be;"><span style="font-weight: 400;"><span style="color: #008000; font-family: Georgia, Palatino; font-size: 12pt;"><span style="color: #000000; font-family: Georgia, Palatino; font-size: 12pt;"><span style="color: #000000;"><strong>• Verpflegung</strong>: Gesundes Frühstücksbuffet (Halbpension optional)<br />\n</span></span></span></span></span><span style="color: #1e73be;"><span style="font-weight: 400;"><span style="color: #008000; font-family: Georgia, Palatino; font-size: 12pt;"><span style="color: #000000; font-family: Georgia, Palatino; font-size: 12pt;"><span style="color: #000000;"><strong>• Training</strong>: 5x CrossFit, 1x Hyrox, 1x Yoga<br />\n</span></span></span></span></span><span style="color: #1e73be;"><span style="font-weight: 400;"><span style="color: #008000; font-family: Georgia, Palatino; font-size: 12pt;"><span style="color: #000000; font-family: Georgia, Palatino; font-size: 12pt;"><span style="color: #000000;"><strong>• Betreuung</strong>: durch deutschsprachige Reiseathleten Guides<br />\n</span></span></span></span></span><span style="color: #1e73be;"><span style="font-weight: 400;"><span style="color: #008000; font-family: Georgia, Palatino; font-size: 12pt;"><span style="color: #000000; font-family: Georgia, Palatino; font-size: 12pt;"><span style="color: #000000;"><strong>• Transfer</strong>: Flughafentransfer<br />\n</span></span></span></span></span><span style="color: #1e73be;"><span style="font-weight: 400;"><span style="color: #008000; font-family: Georgia, Palatino; font-size: 12pt;"><span style="color: #000000; font-family: Georgia, Palatino; font-size: 12pt;"><span style="color: #000000;"><strong>• Reiseathleten Vorteile</strong>: u.a. flexible Umbuchung, deutschsprachige Betreuung<br />\n</span></span></span></span></span><span style="color: #1e73be;"><span style="font-weight: 400;"><span style="color: #008000; font-family: Georgia, Palatino; font-size: 12pt;"><span style="color: #000000; font-family: Georgia, Palatino; font-size: 12pt;"><span style="color: #000000;"><strong>• Reiseathleten Community</strong>: Zugang zur Reise', 'https://www.reiseathleten.de/wp-content/uploads/2021/03/Reiseathleten-CrossFit-27-Mallorca-1.jpg', 'crossfit-27-basispaket-an-der-costa-adeje-fitnessurlaub-auf-teneriffa-spanien', 'https://www.reiseathleten.de/fitnessurlaub/crossfit-27-basispaket-an-der-costa-adeje-fitnessurlaub-auf-teneriffa-spanien/', '2021-03-01T14:00:00', '2021-03-01T13:00:00', '2021-03-01T14:00:00', '2021-03-01T13:00:00', 'simple', 'publish', '0', 5);


INSERT INTO "public"."AcitivityTag" ("tagId", "activityDescriptionId") VALUES (1, 1);
INSERT INTO "public"."AcitivityTag" ("tagId", "activityDescriptionId") VALUES (2, 2);
INSERT INTO "public"."AcitivityTag" ("tagId", "activityDescriptionId") VALUES (3, 3);
INSERT INTO "public"."AcitivityTag" ("tagId", "activityDescriptionId") VALUES (4, 4);
INSERT INTO "public"."AcitivityTag" ("tagId", "activityDescriptionId") VALUES (4, 5);

-- insert into default -> tenerife has default 2 crossfit sessions
INSERT INTO "public"."DefaultVacationActivity" ("vacationDescriptionId", "activityDescriptionId") VALUES (1, 1);
-- id 24875 === CrossFit 27 Basispaket an der Costa Adeje
INSERT INTO "public"."DefaultVacationActivity" ("vacationDescriptionId", "activityDescriptionId") VALUES (24875, 1);
INSERT INTO "public"."DefaultVacationActivity" ("vacationDescriptionId", "activityDescriptionId") VALUES (24875, 2);
INSERT INTO "public"."DefaultVacationActivity" ("vacationDescriptionId", "activityDescriptionId") VALUES (24875, 3);

INSERT INTO "public"."Customer" ("first_name", "last_name", "company", "address_1", "address_2", "email", "city", "state", "postcode", "country", "phone", "title", "title_formatted", "shipping_address", "user_id", "birth_date") VALUES ('Max', 'Mustermann', '', 'Musterstraße 1', '', '', 'Musterstadt', 'Musterland', '12345', 'Musterland', '0123456789', 'Mr', 'Mr', '{}', 2, '1990-01-01');

INSERT INTO "public"."Service" ("name", "description") VALUES ('Crossfit Session', 'Crossfit Session with a trainer');
INSERT INTO "public"."Service" ("name", "description") VALUES ('Personal Training', 'Personal Training with a trainer');
INSERT INTO "public"."Service" ("name", "description") VALUES ('Sightseeing', 'Sightseeing in the city');

INSERT INTO "public"."VacationServices" ("vacation_id", "service_id") VALUES (24875, 1);
INSERT INTO "public"."VacationServices" ("vacation_id", "service_id") VALUES (24875, 2);
INSERT INTO "public"."VacationServices" ("vacation_id", "service_id") VALUES (24875, 3);


CREATE TABLE "public"."ViewColumns" (
    "id" SERIAL,
    "modelName" text  NOT NULL ,
    "columnIds" text  NOT NULL ,
    -- user_id
    "user_id" integer  NOT NULL ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- add index -> i always find by user_id && modelName
CREATE UNIQUE INDEX "ViewColumns_modelName_user_id" ON "public"."ViewColumns"("modelName","user_id");