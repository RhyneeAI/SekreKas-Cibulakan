import { Pool, QueryResultRow } from "pg";

let pool: Pool | null = null;

function getDatabaseUrl(): string {
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

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

function toPostgresParams(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await getPool().query<T>(toPostgresParams(sql), params);
  return result.rows;
}
