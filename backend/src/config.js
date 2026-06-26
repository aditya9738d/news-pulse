import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '../.env.local'), override: true });

const rawPythonPath = process.env.PYTHON_PATH || 'python';
const resolvedPythonPath = rawPythonPath.startsWith('.') || rawPythonPath.includes('/') || rawPythonPath.includes('\\')
  ? path.resolve(__dirname, '..', rawPythonPath)
  : rawPythonPath;

export const config = {
  databaseUrl: process.env.DATABASE_URL,
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  pythonPath: resolvedPythonPath,
};
