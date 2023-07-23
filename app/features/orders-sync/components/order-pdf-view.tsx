import { ArrowsPointingOutIcon } from "@heroicons/react/20/solid";
import { useSearchParams } from "@remix-run/react";

const invoice = {
  subTotal: "$8,800.00",
  tax: "$1,760.00",
  total: "$10,560.00",
  items: [
    {
      id: 1,
      title: "Logo redesign",
      description: "New logo and digital asset playbook.",
      hours: "20.0",
      rate: "$100.00",
      price: "$2,000.00",
    },
    {
      id: 2,
      title: "Website redesign",
      description: "Design and program new company website.",
      hours: "52.0",
      rate: "$100.00",
      price: "$5,200.00",
    },
    {
      id: 3,
      title: "Business cards",
      description: 'Design and production of 3.5" x 2.0" business cards.',
      hours: "12.0",
      rate: "$100.00",
      price: "$1,200.00",
    },
    {
      id: 4,
      title: "T-shirt design",
      description: "Three t-shirt design concepts.",
      hours: "4.0",
      rate: "$100.00",
      price: "$400.00",
    },
  ],
};

export function PdfViewInvoiceView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const handleClickFullscreen = () => {
    searchParams.set("fullscreen", "true");
    setSearchParams(searchParams);
  };

  return (
    // width: 21cm;
    // height: 29.7cm;
    <div
      id="pdf-invoice"
      className="relative print:w-[21cm] print:h-[29,7cm] -mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 xl:px-16 xl:pb-20 xl:pt-16"
    >
      <div className="absolute top-4 right-4">
        <button onClick={handleClickFullscreen} aria-label="fullscreen">
          <ArrowsPointingOutIcon className="h-4 w-4" />
        </button>
      </div>

      <h2 className="text-base font-semibold leading-6 text-gray-900">
        Invoice
      </h2>

      <dl className="mt-6 grid grid-cols-1 text-sm leading-6 sm:grid-cols-2 print:grid-cols-2">
        <div className="sm:pr-4">
          <dt className="inline text-gray-500">Issued on</dt>{" "}
          <dd className="inline text-gray-700">
            <time dateTime="2023-23-01">January 23, 2023</time>
          </dd>
        </div>
        <div className="mt-2 sm:mt-0 sm:pl-4">
          <dt className="inline text-gray-500">Due on</dt>{" "}
          <dd className="inline text-gray-700">
            <time dateTime="2023-31-01">January 31, 2023</time>
          </dd>
        </div>
        <div className="mt-6 border-t border-gray-900/5 pt-6 sm:pr-4">
          <dt className="font-semibold text-gray-900">From</dt>
          <dd className="mt-2 text-gray-500">
            <span className="font-medium text-gray-900">Acme, Inc.</span>
            <br />
            7363 Cynthia Pass
            <br />
            Toronto, ON N3Y 4H8
          </dd>
        </div>
        <div className="mt-8 sm:mt-6 sm:border-t sm:border-gray-900/5 sm:pl-4 sm:pt-6">
          <dt className="font-semibold text-gray-900">To</dt>
          <dd className="mt-2 text-gray-500">
            <span className="font-medium text-gray-900">Tuple, Inc</span>
            <br />
            886 Walter Street
            <br />
            New York, NY 12345
          </dd>
        </div>
      </dl>
      <table className="mt-16 w-full whitespace-nowrap text-left text-sm leading-6">
        <colgroup>
          <col className="w-full" />
          <col />
          <col />
          <col />
        </colgroup>
        <thead className="border-b border-gray-200 text-gray-900">
          <tr>
            <th scope="col" className="px-0 py-3 font-semibold">
              Projects
            </th>
            <th
              scope="col"
              className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell"
            >
              Hours
            </th>
            <th
              scope="col"
              className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell"
            >
              Rate
            </th>
            <th scope="col" className="py-3 pl-8 pr-0 text-right font-semibold">
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="max-w-0 px-0 py-5 align-top">
                <div className="truncate font-medium text-gray-900">
                  {item.title}
                </div>
                <div className="truncate text-gray-500">{item.description}</div>
              </td>
              <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell">
                {item.hours}
              </td>
              <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell">
                {item.rate}
              </td>
              <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700">
                {item.price}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th
              scope="row"
              className="px-0 pb-0 pt-6 font-normal text-gray-700 sm:hidden"
            >
              Subtotal
            </th>
            <th
              scope="row"
              colSpan={3}
              className="hidden px-0 pb-0 pt-6 text-right font-normal text-gray-700 sm:table-cell"
            >
              Subtotal
            </th>
            <td className="pb-0 pl-8 pr-0 pt-6 text-right tabular-nums text-gray-900">
              {invoice.subTotal}
            </td>
          </tr>
          <tr>
            <th
              scope="row"
              className="pt-4 font-normal text-gray-700 sm:hidden"
            >
              Tax
            </th>
            <th
              scope="row"
              colSpan={3}
              className="hidden pt-4 text-right font-normal text-gray-700 sm:table-cell"
            >
              Tax
            </th>
            <td className="pb-0 pl-8 pr-0 pt-4 text-right tabular-nums text-gray-900">
              {invoice.tax}
            </td>
          </tr>
          <tr>
            <th
              scope="row"
              className="pt-4 font-semibold text-gray-900 sm:hidden"
            >
              Total
            </th>
            <th
              scope="row"
              colSpan={3}
              className="hidden pt-4 text-right font-semibold text-gray-900 sm:table-cell"
            >
              Total
            </th>
            <td className="pb-0 pl-8 pr-0 pt-4 text-right font-semibold tabular-nums text-gray-900">
              {invoice.total}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

const Pdf = () => {
  return (
    <>
      {" "}
      <div
        style={{
          width: "21cm",
          height: "29.7cm",
        }}
        className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto my-4 sm:my-10"
      >
        <div className="mb-5 pb-5 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Invoice
            </h2>
          </div>

          <div className="inline-flex gap-x-2">
            <a
              className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:focus:ring-offset-gray-800"
              href="#"
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
              </svg>
              Invoice PDF
            </a>
            <a
              className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
              href="#"
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z" />
                <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
              </svg>
              Print
            </a>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="grid space-y-3">
              <dl className="grid sm:flex gap-x-3 text-sm">
                <dt className="min-w-[150px] max-w-[200px] text-gray-500">
                  Billed to:
                </dt>
                <dd className="text-gray-800 dark:text-gray-200">
                  <a
                    className="inline-flex items-center gap-x-1.5 text-blue-600 decoration-2 hover:underline font-medium"
                    href="#"
                  >
                    sara@site.com
                  </a>
                </dd>
              </dl>

              <dl className="grid sm:flex gap-x-3 text-sm">
                <dt className="min-w-[150px] max-w-[200px] text-gray-500">
                  Billing details:
                </dt>
                <dd className="font-medium text-gray-800 dark:text-gray-200">
                  <span className="block font-semibold">Sara Williams</span>
                  <address className="not-italic font-normal">
                    280 Suzanne Throughway,
                    <br />
                    Breannabury, OR 45801,
                    <br />
                    United States
                    <br />
                  </address>
                </dd>
              </dl>

              <dl className="grid sm:flex gap-x-3 text-sm">
                <dt className="min-w-[150px] max-w-[200px] text-gray-500">
                  Shipping details:
                </dt>
                <dd className="font-medium text-gray-800 dark:text-gray-200">
                  <span className="block font-semibold">Sara Williams</span>
                  <address className="not-italic font-normal">
                    280 Suzanne Throughway,
                    <br />
                    Breannabury, OR 45801,
                    <br />
                    United States
                    <br />
                  </address>
                </dd>
              </dl>
            </div>
          </div>

          <div>
            <div className="grid space-y-3">
              <dl className="grid sm:flex gap-x-3 text-sm">
                <dt className="min-w-[150px] max-w-[200px] text-gray-500">
                  Invoice number:
                </dt>
                <dd className="font-medium text-gray-800 dark:text-gray-200">
                  ADUQ2189H1-0038
                </dd>
              </dl>

              <dl className="grid sm:flex gap-x-3 text-sm">
                <dt className="min-w-[150px] max-w-[200px] text-gray-500">
                  Currency:
                </dt>
                <dd className="font-medium text-gray-800 dark:text-gray-200">
                  USD - US Dollar
                </dd>
              </dl>

              <dl className="grid sm:flex gap-x-3 text-sm">
                <dt className="min-w-[150px] max-w-[200px] text-gray-500">
                  Due date:
                </dt>
                <dd className="font-medium text-gray-800 dark:text-gray-200">
                  10 Jan 2023
                </dd>
              </dl>

              <dl className="grid sm:flex gap-x-3 text-sm">
                <dt className="min-w-[150px] max-w-[200px] text-gray-500">
                  Billing method:
                </dt>
                <dd className="font-medium text-gray-800 dark:text-gray-200">
                  Send invoice
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-6 border border-gray-200 p-4 rounded-lg space-y-4 dark:border-gray-700">
          <div className="hidden sm:grid sm:grid-cols-5">
            <div className="sm:col-span-2 text-xs font-medium text-gray-500 uppercase">
              Item
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase">
              Qty
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase">
              Rate
            </div>
            <div className="text-right text-xs font-medium text-gray-500 uppercase">
              Amount
            </div>
          </div>

          <div className="hidden sm:block border-b border-gray-200 dark:border-gray-700"></div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <div className="col-span-full sm:col-span-2">
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Item
              </h5>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                Design UX and UI
              </p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Qty
              </h5>
              <p className="text-gray-800 dark:text-gray-200">1</p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Rate
              </h5>
              <p className="text-gray-800 dark:text-gray-200">5</p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Amount
              </h5>
              <p className="sm:text-right text-gray-800 dark:text-gray-200">
                $500
              </p>
            </div>
          </div>

          <div className="sm:hidden border-b border-gray-200 dark:border-gray-700"></div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <div className="col-span-full sm:col-span-2">
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Item
              </h5>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                Web project
              </p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Qty
              </h5>
              <p className="text-gray-800 dark:text-gray-200">1</p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Rate
              </h5>
              <p className="text-gray-800 dark:text-gray-200">24</p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Amount
              </h5>
              <p className="sm:text-right text-gray-800 dark:text-gray-200">
                $1250
              </p>
            </div>
          </div>

          <div className="sm:hidden border-b border-gray-200 dark:border-gray-700"></div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <div className="col-span-full sm:col-span-2">
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Item
              </h5>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                SEO
              </p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Qty
              </h5>
              <p className="text-gray-800 dark:text-gray-200">1</p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Rate
              </h5>
              <p className="text-gray-800 dark:text-gray-200">6</p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Amount
              </h5>
              <p className="sm:text-right text-gray-800 dark:text-gray-200">
                $2000
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex sm:justify-end">
          <div className="w-full max-w-2xl sm:text-right space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
              <dl className="grid sm:grid-cols-5 gap-x-3 text-sm">
                <dt className="col-span-3 text-gray-500">Subotal:</dt>
                <dd className="col-span-2 font-medium text-gray-800 dark:text-gray-200">
                  $2750.00
                </dd>
              </dl>

              <dl className="grid sm:grid-cols-5 gap-x-3 text-sm">
                <dt className="col-span-3 text-gray-500">Total:</dt>
                <dd className="col-span-2 font-medium text-gray-800 dark:text-gray-200">
                  $2750.00
                </dd>
              </dl>

              <dl className="grid sm:grid-cols-5 gap-x-3 text-sm">
                <dt className="col-span-3 text-gray-500">Tax:</dt>
                <dd className="col-span-2 font-medium text-gray-800 dark:text-gray-200">
                  $39.00
                </dd>
              </dl>

              <dl className="grid sm:grid-cols-5 gap-x-3 text-sm">
                <dt className="col-span-3 text-gray-500">Amount paid:</dt>
                <dd className="col-span-2 font-medium text-gray-800 dark:text-gray-200">
                  $2789.00
                </dd>
              </dl>

              <dl className="grid sm:grid-cols-5 gap-x-3 text-sm">
                <dt className="col-span-3 text-gray-500">Due balance:</dt>
                <dd className="col-span-2 font-medium text-gray-800 dark:text-gray-200">
                  $0.00
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      {/* </dd> */}
    </>
  );
};
