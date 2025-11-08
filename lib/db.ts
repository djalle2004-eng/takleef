import { neon } from '@neondatabase/serverless';

type NeonQueryFunction = ReturnType<typeof neon>;

let sqlInstance: NeonQueryFunction | null = null;

function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (process.env.NETLIFY_DATABASE_URL) {
    return process.env.NETLIFY_DATABASE_URL;
  }

  if (process.env.NETLIFY_DATABASE_URL_UNPOOLED) {
    return process.env.NETLIFY_DATABASE_URL_UNPOOLED;
  }

  return undefined;
}

export function getSql(): NeonQueryFunction {
  const connectionString = resolveDatabaseUrl();

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  if (!sqlInstance) {
    sqlInstance = neon(connectionString);
  }

  return sqlInstance;
}

export const sql: any = (...args: any[]) => {
  const client = getSql();
  return (client as any)(...args);
};

// Initialize database tables
export async function initDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'PROFESSOR',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create password reset tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create professors table
    await sql`
      CREATE TABLE IF NOT EXISTS professors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        full_name_arabic VARCHAR(255) NOT NULL,
        full_name_latin VARCHAR(255) NOT NULL,
        academic_rank VARCHAR(100) NOT NULL,
        professional_email VARCHAR(255) NOT NULL,
        personal_email VARCHAR(255),
        primary_phone VARCHAR(50) NOT NULL,
        secondary_phone VARCHAR(50),
        phd_specialization TEXT NOT NULL,
        field_of_research TEXT,
        department VARCHAR(255) NOT NULL,
        profile_completed BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create academic years table
    await sql`
      CREATE TABLE IF NOT EXISTS academic_years (
        id SERIAL PRIMARY KEY,
        year_name VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create modules table
    await sql`
      CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        module_code VARCHAR(50) UNIQUE NOT NULL,
        module_name_arabic VARCHAR(255) NOT NULL,
        module_name_english VARCHAR(255) NOT NULL,
        credits INTEGER NOT NULL,
        semester INTEGER NOT NULL,
        department VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
