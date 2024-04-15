import express, { Request, Response } from 'express';
import { Pool } from 'pg';

// Define an interface for applicant data to ensure type safety throughout the app.
// Normally, you would define interfaces in a separate file, e.g., `src/interfaces/applicant.ts`.
interface Applicant {
  id?: number;
  name: string;
  email: string;
  profile: string;
}

// Setup Express app
const app = express();
const port = process.env.PORT || 3000;

// Database connections would typically be managed in a separate file, e.g., `src/database/index.ts`.
// IMPORTANT: Never hardcode sensitive information directly in your source code.
// Use environment variables or secret management tools like AWS Secrets Manager, HashiCorp Vault, or even environment
// configuration tools like dotenv for local development.
const pool = new Pool({
  user: process.env.DB_USER,    // Database username from environment variables
  host: 'localhost',
  database: 'awesome_applicant',
  password: process.env.DB_PASSWORD,    // Database password from environment variables
  port: parseInt(process.env.DB_PORT || '5432'),  // Ensure the port is a number
});

app.use(express.json()); // Middleware to parse JSON requests

// Get information about an applicant
app.get('/awesome/applicant', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query<Applicant>('SELECT * FROM applicants');
    res.json(result.rows);
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    client.release();
  }
});

// CRUD Operations
// CREATE a new applicant
app.post('/awesome/applicant', async (req: Request, res: Response) => {
  const { name, email, profile } = req.body as Applicant;
  const client = await pool.connect();
  try {
    const result = await client.query<Applicant>('INSERT INTO applicants (name, email, profile) VALUES ($1, $2, $3) RETURNING *', [name, email, profile]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Insert failed:', error);
    res.status(500).send('Failed to create new record');
  } finally {
    client.release();
  }
});

// READ a specific applicant by ID
app.get('/awesome/applicant/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const client = await pool.connect();
  try {
    const result = await client.query<Applicant>('SELECT * FROM applicants WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Applicant not found');
    }
  } catch (error) {
    console.error('Query failed:', error);
    res.status(500).send('Failed to retrieve data');
  } finally {
    client.release();
  }
});

// UPDATE an applicant's details
app.put('/awesome/applicant/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, email, profile } = req.body as Applicant;
  const client = await pool.connect();
  try {
    const result = await client.query<Applicant>('UPDATE applicants SET name = $1, email = $2, profile = $3 WHERE id = $4 RETURNING *', [name, email, profile, id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Applicant not found');
    }
  } catch (error) {
    console.error('Update failed:', error);
    res.status(500).send('Failed to update record');
  } finally {
    client.release();
  }
});

// DELETE an applicant
app.delete('/awesome/applicant/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM applicants WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Delete failed:', error);
    res.status(500).send('Failed to delete record');
  } finally {
    client.release();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
