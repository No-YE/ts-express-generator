import { createServer } from 'http';
import app from '../app';
import { port } from '../config';

const PORT = port || 3000;

createServer(app).listen(PORT, () => console.log('start'));