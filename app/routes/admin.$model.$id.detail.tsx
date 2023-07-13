import { type DataFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, useSubmit } from "@remix-run/react";
import React from "react";
import invariant from "tiny-invariant";
import { Form, Layout, Table } from "~/components";
import { prisma } from "~/db.server";
import { getDateString } from "~/utils/helper";
import { getFormDataValue } from "~/utils/lib/core";
import { LibSliderOver, LibForm } from "~/utils/lib/react";

interface ActivityType {
  name: string;
  description: string;
  datetime: string;
  isFixedDate: boolean;
  id: number;
}

export const loader = async ({ request }: DataFunctionArgs) => {
  const v = await prisma.vacation.findFirst({
    include: {
      User: true,
      Location: true,
      VacationActivity: {
        include: {
          ActivityBooking: {
            include: {
              AcitivityDescription: true,
            },
          },
        },
      },
    },
  });

  //   vacations[0].VacationActivity[0].
  return {
    ...v,
    email: v?.User?.email || "",
    location: v?.Location?.name || "",
    activities:
      v?.VacationActivity?.map((va) => va.ActivityBooking)
        .map((ab) => ({
          ...ab,
          description: ab.AcitivityDescription?.description || "",
          name: ab.AcitivityDescription?.name || "",
        }))
        .flat() || [],
  };
};

export const action = async ({ request, params }: DataFunctionArgs) => {
  const { id } = params;
  const url = new URL(request.url);
  const activityId = url.searchParams.get("activityId");

  const formData = await request.formData();
  const datetime = getFormDataValue(formData, "datetime");
  const action = getFormDataValue(formData, "action");
  const activity = getFormDataValue(formData, "activity");

  const handleUpdate = async () => {
    invariant(datetime, "datetime is required");
    invariant(id, "id is required");
    invariant(activityId, "activityId is required");

    await prisma.activityBooking.update({
      where: {
        id: +activityId,
      },
      data: {
        datetime: new Date(datetime),
      },
    });
  };

  const handleDelete = async () => {
    const activityId = formData.get("activityId");
    invariant(activityId, "activityId is required");

    await prisma.activityBooking.delete({
      where: {
        id: +activityId,
      },
    });
  };

  const handleAdd = async () => {
    invariant(id, "id is required");
    invariant(activity, "activity is required");

    await prisma.activityBooking.create({
      data: {
        datetime: datetime || undefined,
        isFixedDate: false,
        AcitivityDescription: {
          connect: {
            id: +activity,
          },
        },
        VacationActivity: {
          create: {
            vacationId: +id,
          },
        },
      },
    });
  };

  // console.log({ url, activityId });

  if (action === "delete") {
    await handleDelete();
  } else if (activityId === "new") {
    await handleAdd();
  } else {
    await handleUpdate();
  }

  return {
    success: true,
  };
};

export default function AdminModelPage() {
  // const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();

  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleClickEditActivity = (activity: ActivityType) => {
    searchParams.set("activityId", activity.id.toString());

    setSearchParams(searchParams);
  };

  const handleClickAdd = () => {
    searchParams.set("activityId", "new");
    setSearchParams(searchParams);
  };

  const handleClickDelete = (activity: ActivityType) => {
    submit(
      {
        activityId: activity.id.toString(),
        action: "delete",
      },
      {
        method: "POST",
      }
    );
  };

  const currentActivityId = searchParams.get("activityId");
  const currentActivity = data.activities.find(
    (a) => a.id.toString() === currentActivityId
  );

  const showModal = !!currentActivityId;
  const titleSlideOver =
    currentActivityId === "new" ? "Add Activity" : "Edit Activity";

  return (
    <>
      <Layout>
        <div className="flex flex-col items-center justify-center space-y-16">
          <div className="pt-4 flex flex-col space-y-2 pb-8">
            <h1 className="text-4xl text-center leading-9 text-black font-extrabold tracking-tight sm:text-4xl sm:leading-10">
              {data.name} ({data.id})
            </h1>

            <h3 className="text-xl text-center leading-9 text-gray-700 font-extrabold tracking-tight sm:text-4xl sm:leading-10">
              {data.description}
            </h3>

            {/* <div className="flex flex-row justify-center space-x-4">
              <button className="bg-black hover:bg-indigo-300 text-white font-bold py-2 px-4 rounded">
                Edit
              </button>

              <button className="bg-red-400 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Delete
              </button>
            </div> */}
          </div>

          <div className="flex flex-row space-x-4">
            <div className="border-[1px] border-gray-200 rounded-xl shadow-sm p-4 space-y-2">
              <h3 className="text-gray-500 text-lg">Start</h3>
              <h2 className="text-2xl leading-9 text-black font-extrabold tracking-tight sm:text-4xl sm:leading-10">
                {data.startDate?.slice(0, 10)}
              </h2>
            </div>

            <div className="border-[1px] border-gray-200 rounded-xl shadow-sm p-4 space-y-2">
              <h3 className="text-gray-500 text-lg">End</h3>
              <h2 className="text-2xl leading-9 text-black font-extrabold tracking-tight sm:text-4xl sm:leading-10">
                {data.endDate?.slice(0, 10)}
              </h2>
            </div>

            <div className="border-[1px] border-gray-200 rounded-xl shadow-sm p-4 space-y-2">
              <h3 className="text-gray-500 text-lg">Location Info</h3>
              <h2 className="text-2xl leading-9 text-black font-extrabold tracking-tight sm:text-4xl sm:leading-10">
                {data.location}
              </h2>
            </div>

            {/*  User */}
            <div className="border-[1px] border-gray-200 rounded-xl shadow-sm p-4 space-y-2">
              <h3 className="text-gray-500 text-lg">User</h3>
              <h2 className="text-2xl leading-9 text-black font-extrabold tracking-tight sm:text-4xl sm:leading-10">
                {data.User?.email}
              </h2>
            </div>
          </div>

          <div className="w-full">
            <Table
              onEdit={handleClickEditActivity}
              onDelete={handleClickDelete}
              onAdd={handleClickAdd}
              subtitle="Manage the activities for the vacation"
              dataList={data.activities.map((a) => ({
                description: a.AcitivityDescription?.description || "",
                name: a.AcitivityDescription?.name || "",
                datetime: a.datetime
                  ? getDateString(new Date(a.datetime || ""))
                  : "",
                isFixedDate: a.isFixedDate || false,
                id: a.id,
              }))}
              columns={[
                {
                  header: "Activity",
                  accessorKey: "name",
                },
                {
                  header: "description",
                  accessorKey: "description",
                },
                {
                  header: "Date",
                  accessorKey: "datetime",
                },
                {
                  header: "Fixed",
                  accessorKey: "isFixedDate",
                },
              ]}
              title={""}
            />
          </div>
        </div>
      </Layout>

      <LibSliderOver
        isOpen={showModal}
        onCancel={() => {
          searchParams.delete("activityId");
          setSearchParams(searchParams);
        }}
      >
        <LibForm
          title={titleSlideOver}
          onCancel={() => {
            searchParams.delete("activityId");
            setSearchParams(searchParams);
          }}
        >
          <Form.DefaultInput
            name="datetime"
            label="Date"
            type="datetime-local"
            value={getDateString(new Date(currentActivity?.datetime || ""))}
          />

          {/* actions function must be able to handle add actions */}
          <Form.Select
            name="activity"
            onSelect={() => null}
            selectId={currentActivity?.acitivityDescriptionId}
            value={currentActivity?.name}
          />
        </LibForm>
      </LibSliderOver>
    </>
  );
}
