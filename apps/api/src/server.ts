import 'dotenv/config';
import { createApp } from './app.js';

const app = createApp();
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`\n🚀 JB51 Store API server running on http://localhost:${port}`);
  console.log(`📡 tRPC endpoint available at http://localhost:${port}/trpc`);
  console.log(`📖 Scalar OpenAPI Docs: http://localhost:${port}/docs\n`);
});
