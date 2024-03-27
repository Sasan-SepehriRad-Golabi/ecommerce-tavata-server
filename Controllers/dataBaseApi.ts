import { poolPromise } from "./dataBaseConnection";
import sql from "mssql"
//inputParams are like [{name:InParm1,
//type: int | float | nvarchar(50) | nvarchar(100) |
//nvarchar(max) | varchar(50) | varchar(100) | varchar(max),value:value}]
export async function executesql(sqlsp: string, inputParams: (any)[], outputParams: (any)[], callback: any) {
    let pool: any;
    try {
        pool = await poolPromise;
    }
    catch (err) {
        pool = null;
        console.log("error occured in establishing sql connection pool")
    }
    try {
        let request = pool.request();
        var sqlType: sql.ISqlTypeFactory;
        var sqlTypes: Array<sql.ISqlTypeFactory> = [];
        var outsqlType: sql.ISqlTypeFactory;
        var outsqlTypes: (sql.ISqlTypeFactory)[] = []
        if (inputParams && inputParams.length > 0) {
            for (var inParam of inputParams) {
                switch (inParam.type) {
                    case 'bit':
                        sqlType = sql.Bit;
                        break;
                    case 'int':
                        sqlType = sql.Int;
                        break;
                    case 'numeric':
                        sqlType = sql.Numeric;
                        break;
                    case 'bigint':
                        sqlType = sql.BigInt;
                        break;
                    case 'double':
                        sqlType = sql.Float
                        break;
                    case 'varchar(50)':
                        sqlType = sql.VarChar(10);
                        break;
                    case 'varchar(50)':
                        sqlType = sql.VarChar(50);
                        break;
                    case 'varchar(100)':
                        sqlType = sql.VarChar(100);
                        break;
                    case 'varchar(max)':
                        sqlType = sql.VarChar(sql.MAX);
                        break;
                    case 'nvarchar(10)':
                        sqlType = sql.NVarChar(10);
                        break;
                    case 'nvarchar(50)':
                        sqlType = sql.NVarChar(50);
                        break;
                    case 'nvarchar(100)':
                        sqlType = sql.NVarChar(100);
                        break;
                    case 'nvarchar(max)':
                        sqlType = sql.NVarChar(sql.MAX);
                        break;
                    case 'varbinary(max)':
                        sqlType = sql.VarBinary(sql.MAX);
                        break;
                    default:
                        sqlType = sql.Bit;
                }
                sqlTypes.push(sqlType);
            }
            for (var index = 0; index < inputParams.length; index++) {
                request.input(inputParams[index].name, sqlTypes[index], inputParams[index].value);
            }
        }
        if (outputParams && outputParams.length > 0) {
            for (var outParam of outputParams) {
                switch (outParam.type) {
                    case 'int':
                        outsqlType = sql.Int;
                        break;
                    case 'numeric':
                        outsqlType = sql.Numeric;
                        break;
                    case 'bigint':
                        outsqlType = sql.BigInt;
                        break;
                    case 'double':
                        outsqlType = sql.Float
                        break;
                    case 'varchar(10)':
                        outsqlType = sql.VarChar(10);
                        break;
                    case 'varchar(50)':
                        outsqlType = sql.VarChar(50);
                        break;
                    case 'varchar(100)':
                        outsqlType = sql.VarChar(100);
                        break;
                    case 'varchar(max)':
                        outsqlType = sql.VarChar(sql.MAX);
                        break;
                    case 'nvarchar(10)':
                        outsqlType = sql.NVarChar(10);
                        break;
                    case 'nvarchar(50)':
                        outsqlType = sql.NVarChar(50);
                        break;
                    case 'nvarchar(100)':
                        outsqlType = sql.NVarChar(100);
                        break;
                    case 'nvarchar(max)':
                        outsqlType = sql.NVarChar(sql.MAX);
                        break;
                    case 'varbinary(max)':
                        outsqlType = sql.VarBinary(sql.MAX);
                        break;
                    case 'bit':
                        outsqlType = sql.Bit;
                        break;
                    default:
                        outsqlType = sql.Bit;
                }
                outsqlTypes.push(outsqlType);
            }
            for (var index = 0; index < outputParams.length; index++) {
                request.output(outputParams[index].name, outsqlTypes[index]);
            }
        }
        request.execute(sqlsp).then((result: { recordset: (any)[], output: any }) => {
            if (outputParams && outputParams.length > 0) {
                callback(null, { recordset: result.recordset, output: result.output });
            }
            else {
                // console.log(result)
                callback(null, { recordset: result.recordset, output: {} });
            }
        })
            .catch((error: Error) => {
                callback(error, null)
            })
    }
    catch (error) {
        callback(error, false);
    }
}
