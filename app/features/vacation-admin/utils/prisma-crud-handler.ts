import { type PrismaClient } from "@prisma/client";
import invariant from "tiny-invariant";
import { getFormDataValue } from "~/utils/lib/core";
import { type ActionFunctionArgs } from "~/utils/lib/types";

type Model = "acitivityDescription" | "tag" | "location" | "vacation";

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

    await this.prisma[this.model]?.delete?.({
      where: {
        id,
      },
    });
  }

  async add(
    props: ActionFunctionArgs & {
      fields: string[];
    }
  ) {
    await this.prisma[this.model]?.create({
      data: this._getFieldValues(props),
    });
  }

  async update(
    props: ActionFunctionArgs & {
      fields: string[];
    }
  ) {
    const url = new URL(props.request.url);
    const id = +(url.searchParams.get("id") || "");

    await this.prisma[this.model]?.update({
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

    await this.prisma[this.model]?.deleteMany({
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
  }: {
    formData?: FormData;
    fields: string[];
  }) {
    return fields.reduce((prev, current) => {
      const value = getFormDataValue(formData, current);
      invariant(value, `${current} is required`);
      return {
        ...prev,
        [current]: value,
      };
    }, {});
  }
}
