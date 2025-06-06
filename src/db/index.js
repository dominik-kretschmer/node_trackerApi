import knex from "knex";

let db;

for (let i = 0; i < 10; i++) {
    try {
        db = knex({
            client: "mysql2",
            connection: {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            },
        });
        console.log("Mit Datenbank verbunden");
        break;
    } catch {
        await new Promise((res) => setTimeout(res, 2000));
    }
}

export { db };
