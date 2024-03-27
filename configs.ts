export const sqlConfigs = {
    user: 'tavata_sql',
    password: "Tt@654321",
    database: "tavata",
    server: 'localhost',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}
export const requestConditions = {
    '1': 'reserved',//1
    '2': 'reserveCancelByUser',//2
    '3': 'reserveCancelByTimeElapsed',//3
    '4': 'boughtByZarrinPal-InProcess',//4
    '41': 'boughtByZarrinPal-Successful',
    '42': 'boughtByZarrinPal-Failed',
    '5': 'boughtByBankGateWay-InProcess',//5
    '51': 'boughtByBankGateWay-Successful',
    '52': 'boughtByBankGateWay-Failed',
    '6': 'boughtByAdminManual-InProcess',//6
    '61': 'boughtByAdminManual-Successfull',
    '62': 'boughtByAdminManual-Failed',
    '7': 'boughtCanceled'
}

//product  reserve stages
//0->reserved,1->reserved to buy procedure,2->reserved cancel by user,3->reserve cancel by time elapsed
//product buy stages
//(reserve=1 and buy=1=>bought by zarrinpal, reserve=1 and buy=2=>buy by bank gatway,reserve=1 and buy=3=>buy by admin contact)