import { prisma } from "~/db.server";
import type { Repository, UseCases } from "~/utils/stuff.server";
import { type RawProduct } from "../api/types";

export const syncProductsUsecase = async ({
  useCases,
  repository,
}: {
  repository: Repository;
  useCases: UseCases;
}) => {
  // give me the last one sort by date_imported
  const lastImportedVacation = await prisma.vacationDescription.findFirst({
    orderBy: {
      date_imported: "desc",
    },
  });

  let allProducts: RawProduct[] = [];
  const getLatestProducts = async () => {
    const products = await repository.products.getLatest({
      offset: allProducts.length,
      limit: 20,
      after: lastImportedVacation?.date_imported,
    });

    allProducts = [...allProducts, ...products];

    if (products.length < 20) {
      return;
    } else {
      await getLatestProducts();
    }
  };

  await getLatestProducts();

  await allProducts.map(async (product) => {
    await prisma.vacationDescription.createMany({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        slug: product.slug,
        permalink: product.permalink,
        date_created: product.date_created,
        date_created_gmt: product.date_created_gmt,
        date_modified: product.date_modified,
        date_modified_gmt: product.date_modified_gmt,
        type: product.type,
        status: product.status,
        image_url: product.images[0].src,
        id: product.id,
        date_imported: new Date().toISOString(),
      },
      skipDuplicates: true,
    });
  });
};
