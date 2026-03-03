import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import * as dotenv from "dotenv";
import { Todo } from "@/entities/Todo";
import { TodoRecurrence } from "@/entities/TodoRecurrence";
import { User } from "@/entities/User";
import { Weather } from "@/entities/Weather";
import { WeatherHour } from "@/entities/WeatherHour";
import { TodoCheck } from "@/entities/TodoCheck";

dotenv.config({});

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
  synchronize: true,
  logging: true,
}

const devOrProdDataSource = {
  ...(isDevMode ? devType : prodType),
  entities: [Todo, TodoRecurrence, TodoCheck, User, Weather, WeatherHour],
  subscribers: [],
  migrations: ["database/*.ts"],
};

export const AppDataSource = new DataSource(devOrProdDataSource);

export const getDatabaseConnection = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};