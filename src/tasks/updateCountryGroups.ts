import "dotenv/config";
import countriesByDiscount from "@/data/countriesByDiscount.json";
import { db } from "@/drizzle/db";
import { CountryGroupTable, CountryTable } from "@/drizzle/schema";
import { CACHE_TAGS, revalidateDBCache } from "@/lib/cache";
import { sql } from "drizzle-orm";

const groupCount = await updateCountryGroups();
const countryCount = await updateCountries();
console.log(
  `Updated ${groupCount} country groups and ${countryCount} countries`
);

async function updateCountryGroups() {
  const countryGroupInsertData = countriesByDiscount.map(
    ({ name, recommendedDiscountPercentage }) => {
      return {
        name,
        recommendedDiscountPercentage,
      };
    }
  );

  const { rowCount } = await db
    .insert(CountryGroupTable)
    .values(countryGroupInsertData)
    .onConflictDoUpdate({
      target: [CountryGroupTable.name],
      set: {
        recommendedDiscountPercentage: sql`${sql.raw(
          "EXCLUDED.recommended_discount_percentage"
        )}`,
      },
    });

  //   revalidateDBCache({ tag: CACHE_TAGS.countryGroups });
  return rowCount;
}

async function updateCountries() {
  const countryGroups = await db.query.CountryGroupTable.findMany({
    columns: { id: true, name: true },
  });

  const countryInsertData = countriesByDiscount.flatMap(
    ({ countries, name }) => {
      const countryGroup = countryGroups.find((cg) => cg.name === name);
      if (!countryGroup) {
        throw new Error(`Country group ${name} not found`);
      }
      return countries.map((country) => {
        return {
          name: country.countryName,
          code: country.country,
          countryGroupId: countryGroup.id,
        };
      });
    }
  );

  const { rowCount } = await db
    .insert(CountryTable)
    .values(countryInsertData)
    .onConflictDoUpdate({
      target: [CountryTable.code],
      set: {
        name: sql`excluded.name`,
        countryGroupId: sql`excluded.country_group_id`,
      },
    });

  //   revalidateDBCache({ tag: CACHE_TAGS.countries });
  return rowCount;
}
