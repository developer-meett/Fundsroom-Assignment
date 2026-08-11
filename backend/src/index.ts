import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.get('/api/status', (req, res) => {
  res.json({ message: 'Backend is running correctly and connected to frontend!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
