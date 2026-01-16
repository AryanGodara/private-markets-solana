import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import marketRoutes from './routes/markets';
import tradingRoutes from './routes/trading';
import agentRoutes from './routes/agent';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/markets', marketRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/agent', agentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Dark Alpha API running on port ${port}`);
});

export default app;