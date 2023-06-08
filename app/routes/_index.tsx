import type { DataFunctionArgs, V2_MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Activity, Tag, getXataClient } from "utils/xata";
import { authenticator } from "~/utils/auth.server";
import { isLoggedIn } from "~/utils/helper";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

type ActivityModel = Activity & {
  tags: Tag[];
};

// export const loader = async ({ request }: DataFunctionArgs) => {
//   await isLoggedIn(request);

//   try {
//     const client = getXataClient();

//     const data = await getXataClient().db.Tag.getMany();

//     const activityRaw = await client.db.Activity.select(["*"])
//       .filter({
//         name: { $contains: "Fitness" },
//       })
//       .getFirst();

//     const tags = await client.db.AcivityTag.select(["tag.*"])
//       .filter({
//         "activity.name": { $contains: "Fitness" },
//       })
//       .getMany();

//     if (!activityRaw) {
//       throw new Error("Activity not found");
//     }

//     const activity: ActivityModel = {
//       ...activityRaw,
//       tags: tags.map((tag) => tag.tag).filter(Boolean) as Tag[],
//     };

//     return {
//       tags: data,
//       activity,
//     };
//   } catch (error) {
//     console.log("__ERROR__", error);
//     throw new Error("Something went wrong!!!");
//   }
// };

// export const action = async ({ request }: DataFunctionArgs) => {
//   const form = await request.formData();
//   const action = form.get("action") as string;

//   if (action === "logout") {
//     await authenticator.logout(request, { redirectTo: "/login" });

//     return {};
//   }

//   try {
//     await getXataClient().db.Tag.create({
//       label: "fun",
//       color: "blue",
//     });
//     return {};
//   } catch (error) {
//     return {
//       error: {
//         status: 500,
//         message: "Something went wrong",
//       },
//     };
//   }
// };

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      HELLO WORLD
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div>
      <h1>Oh no, an error occurred!</h1>
      <pre>{JSON.stringify(error)}</pre>
    </div>
  );
}
