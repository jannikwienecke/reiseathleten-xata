// import { useAdminPage, useModel } from "utils/lib/hooks";
// import { redirect } from "@remix-run/node";
// import type { ActionFunctionArgs } from "utils/lib/core";

// export const action = async (props: ActionFunctionArgs) => {
//   // await pageFunction(new AddHandler())(props);
//   return redirect("../");
// };

// export default function Index() {
//   const { currentData } = useAdminPage();

//   const { sliderOver, form, addForm, pageTitle } = useModel();

//   return (
//     <>
//       <sliderOver.Component>
//         <form.Component title={pageTitle}>
//           {addForm.fields.map((field) => {
//             return (
//               <>
//                 <field.Component
//                   {...field}
//                   defaultValue={currentData[field.name]}
//                 />
//               </>
//             );
//           })}
//         </form.Component>
//       </sliderOver.Component>
//     </>
//   );
// }
