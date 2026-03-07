import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import * as dotenv from "dotenv";
import { Todo } from "@/entities/Todo";
import { TodoRecurrence } from "@/entities/TodoRecurrence";
import { User } from "@/entities/User";
import { Weather } from "@/entities/Weather";
import { WeatherHour } from "@/entities/WeatherHour";
import { TodoCheck } from "@/entities/TodoCheck";
import { FlightCrawled } from "@/entities/FlightCrawled";
import { WishlistAmazon } from "@/entities/WishlistAmazon";

dotenv.config({});

let initializationPromise: Promise<DataSource> | null = null;

const isDevMode = process.env.NODE_ENV === "development";

const devType: DataSourceOptions = {
  type: "sqlite",
  database: "database.db",
  synchronize: true,
  logging: true,
};

const prodType: DataSourceOptions = {
  type: "mariadb",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  synchronize: false,
  logging: false,
}

const devOrProdDataSource = {
  ...(prodType),
  entities: [Todo, TodoRecurrence, WishlistAmazon, TodoCheck, FlightCrawled, User, Weather, WeatherHour],
  subscribers: [],
  migrations: [],
};

export const AppDataSource = new DataSource(devOrProdDataSource);

export const getDatabaseConnection = async () => {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = AppDataSource.initialize()
    .then((ds) => {
      console.log("Data Source has been initialized!");
      return ds;
    })
    .catch((err) => {
      initializationPromise = null;
      console.error("Error during Data Source initialization", err);
      throw err;
    });

  return initializationPromise;
};