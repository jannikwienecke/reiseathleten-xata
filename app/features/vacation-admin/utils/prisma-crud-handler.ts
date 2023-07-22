import { type PrismaClient } from "@prisma/client";
import invariant from "tiny-invariant";
import { getFormDataValue } from "~/utils/lib/core";
import { type ActionFunctionArgs } from "~/utils/lib/types";

type Model =
  | "acitivityDescription"
  | "tag"
  | "location"
  | "vacation"
  | "vacationDescription"
  | "vacationActivity"
  | "color"
  | "customer"
  | "defaultVacationActivity";

export class PrismaCrudHandler {
  private prisma: PrismaClient;
  private model: Model;
  constructor(prisma: PrismaClient, model: Model) {
    this.prisma = prisma;
    this.model = model;
  }

  async delete({ formData }: ActionFunctionArgs) {
    const id = +(getFormDataValue(formData, "id") || "");
    invariant(id, "id is required");

    await (this.prisma[this.model as any] as any)?.delete?.({
      where: {
        id,
      },
    });
  }

  async add(
    props: ActionFunctionArgs & {
      fields: string[];
      fieldTransforms?: {
        [key: string]: (value: any) => any;
      };
      optionalFields?: string[];
    }
  ) {
    const data = this._getFieldValues(props);

    await (this.prisma[this.model as any] as any)?.create({
      data,
    });
  }

  async update(
    props: ActionFunctionArgs & {
      fields: string[];
      optionalFields?: string[];
      fieldTransforms?: {
        [key: string]: (value: any) => any;
      };
    }
  ) {
    const url = new URL(props.request.url);
    const id = +(url.searchParams.get("id") || "");

    await (this.prisma[this.model as any] as any)?.update({
      where: {
        id,
      },
      data: this._getFieldValues(props),
    });
  }

  async bulkDelete({ formData }: ActionFunctionArgs) {
    const idsToDelete = JSON.parse(
      getFormDataValue(formData, "ids") || "[]"
    ) as string[];

    await (this.prisma[this.model as any] as any)?.deleteMany({
      where: {
        id: {
          in: idsToDelete.map((id) => +id),
        },
      },
    });
  }

  _getFieldValues({
    fields,
    formData,
    fieldTransforms,
    optionalFields,
  }: {
    formData?: FormData;
    fields: string[];
    optionalFields?: string[];
    fieldTransforms?: {
      [key: string]: (value: any) => any;
    };
  }) {
    return fields.reduce((prev, current) => {
      const value = getFormDataValue(formData, current);

      const isOptional = optionalFields?.includes(current);

      !isOptional && invariant(value, `${current} is required`);
      return {
        ...prev,
        [current]:
          isOptional && !value
            ? null
            : fieldTransforms?.[current]?.(value) || value,
      };
    }, {});
  }
}
