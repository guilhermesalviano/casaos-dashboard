import { NextRequest, NextResponse } from "next/server";
import { getDatabaseConnection } from "@/lib/db";
import { format } from "date-fns";
import { WishlistAmazon } from "@/entities/WishlistAmazon";
import { WishlistInternalAPIResponse } from "@/types/wishlist-api";
import { createMemoryCache } from "@/utils/in-memory-cache";
import { SECONDS_TO_MINUTES } from "@/constants";

const wishlistCache = createMemoryCache<WishlistInternalAPIResponse[]>(SECONDS_TO_MINUTES * 60 * 8);

export async function GET(req: NextRequest) {
  try {
    const cached = wishlistCache.get();
    if (cached) {
      return NextResponse.json({ message: "Wishlist data from cache successfully", data: cached });
    }

    const today = new Date();

    const db = await getDatabaseConnection();
    const wishlistRepository = db.getRepository(WishlistAmazon);

    const cleanPriceSql = (alias: string) => {
      return `CAST(REPLACE(REGEXP_REPLACE(${alias}.price, '[^0-9,]', ''), ',', '.') AS DECIMAL(10,2))`;
    };

    const minPricesPerBook = await wishlistRepository
      .createQueryBuilder("w")
      .select("w.title", "title")
      .addSelect("w.price", "price")
      .addSelect("w.link", "link")
      .where((qb) => {
        const subQuery = qb
        .subQuery()
        .select(`MAX(${cleanPriceSql("s")})`, "maxPrice")
        .from("wishlist_amazon", "s")
          .where("s.title = w.title")
          .andWhere("s.price <> ''")
          .getQuery();

        return `${cleanPriceSql("w")} < (${subQuery})`;
      })
      .andWhere("w.searchDate LIKE :date", { date: `${format(today, "yyyy-MM-dd")}%` })
      .andWhere("w.price <> ''")
      .orderBy(cleanPriceSql("w"), "ASC")
      .getRawMany();
    
    const minPricesPerBookOrdered = minPricesPerBook.sort((a, b) => {
      const parsePrice = (val: string) => {
        const cleanVal = val.replace(/[^\d,.-]/g, '').replace(',', '.');
        return parseFloat(cleanVal) || 0;
      };

      return parsePrice(a.price) - parsePrice(b.price);
    });

    const wishlistData: WishlistInternalAPIResponse[] = minPricesPerBookOrdered.map(item => ({
      name: item.title,
      price: item.price,
      link: item.link,
      store: "Amazon",
      alert: true,
    }));

    wishlistCache.set(wishlistData);

    return NextResponse.json({ message: "Products data retrieved successfully", data: wishlistData }, { status: 200 })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to retrieve products data" }, { status: 500 });
  }
}