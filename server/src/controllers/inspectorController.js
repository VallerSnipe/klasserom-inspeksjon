import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Funksjon for å hente alle inspektører
export const getAllInspectors = async (req, res) => {
  try {
    const inspectors = await prisma.inspector.findMany();
    res.status(200).json(inspectors);
  } catch (error) {
    res.status(500).json({ message: 'Noe gikk galt ved henting av inspektører', error });
  }
};

// Flere funksjoner for inspektører kan legges til her senere