import type { DataFunctionArgs, V2_MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { XataApiClient } from "@xata.io/client";
import { authenticator } from "utils/auth.server";
import { Activity, Tag, TagRecord, getXataClient } from "utils/xata";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

type ActivityModel = Activity & {
  tags: Tag[];
};

export const loader = async () => {
  const client = getXataClient();
  const data = await getXataClient().db.Tag.getMany();

  const activityRaw = await client.db.Activity.select(["*"])
    .filter({
      name: { $contains: "Fitness" },
    })
    .getFirst();

  const tags = await client.db.AcivityTag.select(["tag.*"])
    .filter({
      "activity.name": { $contains: "Fitness" },
    })
    .getMany();

  if (!activityRaw) {
    throw new Error("Activity not found");
  }

  const activity: ActivityModel = {
    ...activityRaw,
    tags: tags.map((tag) => tag.tag).filter(Boolean) as Tag[],
  };

  return {
    tags: data,
    activity,
  };
};

export const action = async ({ request }: DataFunctionArgs) => {
  // add a new tag
  const form = await request.formData();
  const action = form.get("action") as string;

  if (action === "logout") {
    await authenticator.logout(request, { redirectTo: "/" });

    return {};
  }

  try {
    await getXataClient().db.Tag.create({
      label: "fun",
      color: "blue",
    });
    return {};
  } catch (error) {
    return {
      error: {
        status: 500,
        message: "Something went wrong",
      },
    };
  }
};

export default function Index() {
  const { tags, activity } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <p>TAGS OF ACTIVITY {activity.name}</p>
      {activity.tags.map((tag) => (
        <div
          style={{
            backgroundColor: tag.color,
          }}
          key={tag.id}
        >
          {tag.label}
        </div>
      ))}

      <Form method="post">
        <input
          type="text"
          name="action"
          disabled
          hidden
          defaultValue={"logout"}
        />
        <button className="bg-red-800 mt-8">LOGOUT</button>
      </Form>

      <Form method="post">
        <input type="text" name="label" />
        <button type="submit">Add Tag</button>
      </Form>
    </div>
  );
}

// error boundary
export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div>
      <h1>Oh no, an error occurred!</h1>
      <pre>{JSON.stringify(error)}</pre>
    </div>
  );
}
