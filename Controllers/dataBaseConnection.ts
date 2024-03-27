import sql from "mssql"
import { sqlConfigs } from "../configs";
let pool = new sql.ConnectionPool(sqlConfigs);
export const poolPromise = pool.connect();
