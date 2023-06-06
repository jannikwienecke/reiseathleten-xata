export default function Index() {
  return <></>;
}

// import { redirect } from "@remix-run/node";
// import type { ActionFunctionArgs } from "utils/lib/core";
// import { useModel } from "utils/lib/hooks";
// import { pageFunction } from "./admin.$model";

// export const action = async (props: ActionFunctionArgs) => {
//   await pageFunction.action(props);
//   return redirect("../");
// };

// export default function Index() {
//   const { sliderOver, form, addForm, pageTitle } = useModel();

//   return (
//     <>
//       <sliderOver.Component>
//         <form.Component title={pageTitle}>
//           {addForm.fields.map((field) => {
//             return (
//               <>
//                 <field.Component {...field} />
//               </>
//             );
//           })}
//         </form.Component>
//       </sliderOver.Component>
//     </>
//   );
// }
