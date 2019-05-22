import { createServer } from 'http';
import app from '../app';

const PORT = process.env.PORT || 3000;

createServer(app).listen(PORT, () => console.log('start'));