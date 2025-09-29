import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Funksjon for å opprette en ny inspeksjon
export const createInspection = async (req, res) => {
  // Vi henter all dataen fra request body som sendes fra frontend
  const inspectionData = req.body;

  try {
    const newInspection = await prisma.inspection.create({
      data: {
        inspectionDate: new Date(inspectionData.inspectionDate),
        classroom: { connect: { id: parseInt(inspectionData.classroomId) } },
        inspector: { connect: { id: parseInt(inspectionData.inspectorId) } },
        projectorStatus: inspectionData.projectorStatus,
        projectorComment: inspectionData.projectorComment,
        dustFilterStatus: inspectionData.dustFilterStatus,
        lampHours: inspectionData.lampHours,
        lampLifeRemaining: inspectionData.lampLifeRemaining,
        speakerStatus: inspectionData.speakerStatus,
        speakerComment: inspectionData.speakerComment,
        hdmiStatus: inspectionData.hdmiStatus,
        hdmiComment: inspectionData.hdmiComment,
        chargerStatus: inspectionData.chargerStatus,
        chargerComment: inspectionData.chargerComment,
        generalComment: inspectionData.generalComment,
      },
    });
    // Sender tilbake den nye inspeksjonen med status 201 (Created)
    res.status(201).json(newInspection);
  } catch (error) {
    console.error("Feil ved oppretting av inspeksjon:", error);
    res.status(500).json({ message: 'Noe gikk galt ved lagring av inspeksjon', error });
  }
};

// Her kan vi legge til flere funksjoner senere, f.eks. for å hente historikk

// Henter inspeksjoner med relasjoner (classroom, inspector)
export const getInspections = async (req, res) => {
  try {
    const inspections = await prisma.inspection.findMany({
      include: {
        classroom: true,
        inspector: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(inspections);
  } catch (error) {
    console.error('Feil ved henting av inspeksjoner:', error);
    res.status(500).json({ message: 'Noe gikk galt ved henting av inspeksjoner', error });
  }
};

// Hent én inspeksjon etter ID
export const getInspectionById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Ugyldig inspeksjons-ID' });
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: { classroom: true, inspector: true },
    });
    if (!inspection) return res.status(404).json({ message: 'Inspeksjon ikke funnet' });
    res.status(200).json(inspection);
  } catch (error) {
    console.error('Feil ved henting av inspeksjon:', error);
    res.status(500).json({ message: 'Noe gikk galt ved henting av inspeksjon', error });
  }
};

// Oppdater en inspeksjon
export const updateInspection = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Ugyldig inspeksjons-ID' });
    const data = req.body;
    const updated = await prisma.inspection.update({
      where: { id },
      data: {
        inspectionDate: data.inspectionDate ? new Date(data.inspectionDate) : undefined,
        classroomId: data.classroomId ? Number(data.classroomId) : undefined,
        inspectorId: data.inspectorId ? Number(data.inspectorId) : undefined,
        projectorStatus: data.projectorStatus,
        projectorComment: data.projectorComment,
        dustFilterStatus: data.dustFilterStatus,
        lampHours: data.lampHours,
        lampLifeRemaining: data.lampLifeRemaining,
        speakerStatus: data.speakerStatus,
        speakerComment: data.speakerComment,
        hdmiStatus: data.hdmiStatus,
        hdmiComment: data.hdmiComment,
        chargerStatus: data.chargerStatus,
        chargerComment: data.chargerComment,
        generalComment: data.generalComment,
      },
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Feil ved oppdatering av inspeksjon:', error);
    res.status(500).json({ message: 'Noe gikk galt ved oppdatering av inspeksjon', error });
  }
};