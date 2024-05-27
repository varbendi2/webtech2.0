import "reflect-metadata"
import { DataSource } from "typeorm"
import { Warehouse } from "./entity/Warehouse"
import { Manufacturing } from "./entity/Manufacturing"
import { Order } from "./entity/Order"

export const DatabaseData = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    database: "wh",
    synchronize: true,
    logging: true,
    entities: [Warehouse, Manufacturing, Order],
    migrations: [],
    subscribers: [],
})
