require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

function getDatabaseUrl() {
  if (process.env.SUPABASE_DB_URL) {
    return process.env.SUPABASE_DB_URL;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const password = process.env.SUPABASE_PROJECT_PW;

  if (!supabaseUrl || !password) {
    throw new Error(
      "Missing SUPABASE_URL and SUPABASE_PROJECT_PW (or SUPABASE_DB_URL)"
    );
  }

  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;
}

async function main() {
  const pool = new Pool({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
  });

  const dir = path.join(__dirname, "..", "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    console.log(`Running ${file}...`);
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    await pool.query(sql);
  }

  console.log("Semua migration selesai dijalankan.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
