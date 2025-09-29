import express from 'express';
import { createInspection, getInspections, getInspectionById, updateInspection } from '../../controllers/inspectionController.js';

const router = express.Router();

// Når en GET-forespørsel kommer til '/', kjør getInspections-funksjonen
router.get('/', getInspections);

// Når en POST-forespørsel kommer til '/', kjør createInspection-funksjonen
router.post('/', createInspection);

// Hent én inspeksjon
router.get('/:id', getInspectionById);

// Oppdater inspeksjon
router.put('/:id', updateInspection);

export default router;