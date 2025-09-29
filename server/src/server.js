import express from 'express';
import cors from 'cors'; // Importerer CORS-pakken

// Importerer alle rutene for applikasjonen
import classroomRoutes from './api/routes/classroomRoutes.js';
import inspectorRoutes from './api/routes/inspectorRoutes.js';
import inspectionRoutes from './api/routes/inspectionRoutes.js';

// Initialiserer Express-appen
const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000; // Støtt miljøvariabel for skydeploy

// --- Middleware ---

// 1. CORS Middleware: Tillater at frontend (på en annen port) kan snakke med denne serveren
app.use(cors());

// 2. JSON Middleware: Lar serveren forstå JSON-data som sendes i en request body
app.use(express.json());


// --- API Ruter ---

// Kobler URL-stier til de respektive "sentralbordene" (rutene)
app.use('/api/classrooms', classroomRoutes);
app.use('/api/inspectors', inspectorRoutes);
app.use('/api/inspections', inspectionRoutes);


// --- Start Server ---

// Starter serveren og lytter etter forespørsler på den angitte porten
app.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  console.log(` Serveren kjører (env=${env}) på port ${PORT}`);
});