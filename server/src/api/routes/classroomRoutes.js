import express from 'express';
import { getAllClassrooms, getClassroomInspections, getClassroomLatestStatus } from '../../controllers/classroomController.js';

const router = express.Router();

// Når en GET-forespørsel kommer til '/', kjør getAllClassrooms-funksjonen
router.get('/', getAllClassrooms);

// Historikk for et klasserom
router.get('/:id/inspections', getClassroomInspections);

// Siste status for et klasserom
router.get('/:id/status', getClassroomLatestStatus);

export default router;