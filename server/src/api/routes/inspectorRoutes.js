import express from 'express';
import { getAllInspectors } from '../../controllers/inspectorController.js';

const router = express.Router();

// Kobler en GET-forespørsel til / til controller-funksjonen
router.get('/', getAllInspectors);

export default router;