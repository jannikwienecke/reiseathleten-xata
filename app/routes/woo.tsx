import { useLoaderData } from "@remix-run/react";
// import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
// import z from "zod";
import { syncOrdersLoader } from "~/features/orders-sync/server-functions/sync-orders";

export const loader = syncOrdersLoader;

export default function SyncOrdersPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <pre>{JSON.stringify(data?.orders, null, 2)}</pre>
    </div>
  );
}

// const dataJSON = {
//   id: 69961,
//   date_created: "2023-07-11T16:09:52",
//   date_modified: "2023-07-11T16:09:53",
//   total: "652.00",
//   order_key: "wc_order_07U35Ui4RwALT",
//   billing: {
//     first_name: "Stephan",
//     last_name: "Silber",
//     company: "",
//     address_1: "Kerbelweg 26",
//     address_2: "",
//     city: "Hamburg",
//     state: "",
//     postcode: "22337",
//     country: "DE",
//     email: "silber@eb-silber.de",
//     phone: "01757036770",
//     title: "1",
//     title_formatted: "Herr",
//   },
//   shipping: {
//     first_name: "",
//     last_name: "",
//     company: "",
//     address_1: "",
//     address_2: "",
//     city: "",
//     state: "",
//     postcode: "",
//     country: "",
//     phone: "",
//     title: "1",
//     title_formatted: "Herr",
//   },
//   payment_method: "bacs",
//   payment_method_title:
//     "Kauf auf Rechnung (Überweisung). PayPal, MasterCard &amp; Visa Card sind auf Wunsch auch möglich",
//   meta_data: [
//     {
//       id: 1319711,
//       key: "billing_title",
//       value: "Herr",
//     },
//     {
//       id: 1319712,
//       key: "geburtsdatum",
//       value: "11.03.1988",
//     },
//     {
//       id: 1319713,
//       key: "billing_email-2",
//       value: "silber@eb-silber.de",
//     },
//     {
//       id: 1319714,
//       key: "community",
//       value: "Ja, sehr gerne.",
//     },
//     {
//       id: 1319715,
//       key: "kenntnis",
//       value: "Freunde & Bekannte",
//     },
//     {
//       id: 1319716,
//       key: "crossfit",
//       value: "ElbAthletic",
//     },
//     {
//       id: 1319717,
//       key: "anmerkungen_wuensche",
//       value: "Körpergröße: 1,83 m",
//     },
//   ],
//   line_items: [
//     {
//       id: 1426,
//       name: "CrossFit Mallorca Urlaub - Top Box & Premium Hotel am Traumstrand",
//       product_id: 65466,
//       meta_data: [
//         {
//           id: 37684,
//           key: "yith_wcbk_formatted_meta",
//           value: [
//             {
//               display_key: "Von",
//               display_value: "01.10.2023",
//             },
//             {
//               display_key: "Bis",
//               display_value: "06.10.2023",
//             },
//             {
//               display_key: "Dauer",
//               display_value: "5 Tage",
//             },
//             {
//               display_key: "Personen",
//               display_value:
//                 "2 (Anzahl Reiseteilnehmer gesamt &#8211; bitte wähle zusätzlich mind. eine gewünschte Zimmerkategorie aus: 1, Standard Zimmer mit Poolblick (für max. 2 Reiseteilnehmer): 1)",
//             },
//             {
//               display_key: "Services",
//               display_value:
//                 "Fahrrad - Rad International (Top Trekking Rad) - 15 € /Tag (x 1), Frühstück, Unterkunft, WODs im CrossFit Mallorca",
//             },
//           ],
//           display_key: "Von",
//           display_value: "01.10.2023",
//         },
//       ],
//       image: {
//         id: "3637",
//         src: "https://reiseathleten.de/wp-content/uploads/2019/03/h10-casa-del-mar-sunbeds-fitness-urlaub-fitnessreisen-mit-reiseathleten.jpg",
//       },
//       parent_name: null,
//     },
//   ],
// };

// //   zod validation
