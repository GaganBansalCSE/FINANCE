require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
connectDB();

const routes = require('./routes');
const swaggerSpec = require('./docs/swagger');

const app = express();
const PORT = process.env.PORT || 3001;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(cors());

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Finance API is running', timestamp: new Date() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});
