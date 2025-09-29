// Importerer Prisma Client for å kunne snakke med databasen
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// Funksjon for å hente alle klasserom
export const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await prisma.classroom.findMany();
    res.status(200).json(classrooms);
  } catch (error) {
    res.status(500).json({ message: 'Noe gikk galt ved henting av klasserom', error });
  }
};

// Hent inspeksjonshistorikk for et klasserom
export const getClassroomInspections = async (req, res) => {
  try {
    const classroomId = Number(req.params.id);
    if (!classroomId) return res.status(400).json({ message: 'Ugyldig klasserom-ID' });

    const { limit, from, to, page = '1', pageSize = '20' } = req.query;

    const where = { classroomId };
    if (from || to) {
      where.inspectionDate = {};
      if (from) where.inspectionDate.gte = new Date(from);
      if (to) where.inspectionDate.lte = new Date(to);
    }

    const take = limit ? Number(limit) : Number(pageSize) || 20;
    const skip = limit ? 0 : (Math.max(Number(page), 1) - 1) * take;

    const [total, inspections] = await Promise.all([
      prisma.inspection.count({ where }),
      prisma.inspection.findMany({
        where,
        include: { classroom: true, inspector: true },
        orderBy: { inspectionDate: 'desc' },
        take,
        skip,
      })
    ]);

    res.status(200).json({ items: inspections, total });
  } catch (error) {
    res.status(500).json({ message: 'Noe gikk galt ved henting av historikk', error });
  }
};

// Hent siste status for et klasserom
export const getClassroomLatestStatus = async (req, res) => {
  try {
    const classroomId = Number(req.params.id);
    if (!classroomId) return res.status(400).json({ message: 'Ugyldig klasserom-ID' });

    const latest = await prisma.inspection.findFirst({
      where: { classroomId },
      orderBy: { inspectionDate: 'desc' },
      include: { inspector: true, classroom: true },
    });

    if (!latest) return res.status(200).json({ classroomId, latest: null, overallStatus: null });

    const anyBad = [
      latest.projectorStatus,
      latest.dustFilterStatus,
      latest.speakerStatus,
      latest.hdmiStatus,
      latest.chargerStatus,
    ].some((s) => s === 'IKKE_OK');

    res.status(200).json({
      classroomId,
      latest,
      overallStatus: anyBad ? 'IKKE_OK' : 'OK',
    });
  } catch (error) {
    res.status(500).json({ message: 'Noe gikk galt ved henting av siste status', error });
  }
};