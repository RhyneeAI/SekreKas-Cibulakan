require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  const dir = path.join(__dirname, "..", "migrations");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    console.log(`Running ${file}...`);
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    await connection.query(sql);
  }

  console.log("Semua migration selesai dijalankan.");
  await connection.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
