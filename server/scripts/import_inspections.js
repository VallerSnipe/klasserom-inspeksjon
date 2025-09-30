#!/usr/bin/env node
/*
  CSV Importer for Inspections
  Usage:
    node scripts/import_inspections.js "C:\\path\\to\\file.csv"
  or via npm script:
    npm run import:csv -- "C:\\path\\to\\file.csv"
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { parse } from 'csv-parse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Load .env if present
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

function log(msg) {
  process.stdout.write(`[import] ${msg}\n`);
}

function parseDate(value) {
  if (!value) return null;
  // Accept ISO (YYYY-MM-DD) or dd.mm.yyyy or dd/mm/yyyy
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (iso.test(value)) return new Date(value);
  const dot = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/;
  const m = value.match(dot);
  if (m) {
    const [_, d, mo, y] = m;
    const dd = String(d).padStart(2, '0');
    const mm = String(mo).padStart(2, '0');
    return new Date(`${y}-${mm}-${dd}`);
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function normalizeStatus(v) {
  if (!v) return null;
  const s = String(v).trim().toLowerCase();
  if (['ok', 'kontrollert ok', 'kontrollert', 'ok ', 'o.k', 'o k'].includes(s)) return 'OK';
  if (s.includes('ikke')) return 'IKKE_OK';
  if (s === 'ik' || s === 'ikke_ok' || s === 'no' || s === 'bad') return 'IKKE_OK';
  // fallback: exact upper when exactly OK/IKKE_OK
  if (s === 'ok') return 'OK';
  if (s === 'ikke_ok') return 'IKKE_OK';
  // unknown -> try uppercase
  const up = String(v).toUpperCase();
  return up === 'OK' || up === 'IKKE_OK' ? up : null;
}

// Map potential incoming header names to our expected logical keys
const headerMap = {
  // Dates & names
  inspectiondate: 'inspectionDate',
  created_date: 'inspectionDate',
  createddate: 'inspectionDate',
  classroomname: 'classroomName',
  room_name: 'classroomName',
  room: 'classroomName',
  inspectorname: 'inspectorName',
  inspector: 'inspectorName',

  // Statuses
  projector_status: 'projectorStatus',
  projectorstatus: 'projectorStatus',
  dust_filter: 'dustFilterStatus',
  dustfilter: 'dustFilterStatus',
  dustfilterstatus: 'dustFilterStatus',
  speaker_status: 'speakerStatus',
  speakerstatus: 'speakerStatus',
  hdmi_status: 'hdmiStatus',
  hdmi: 'hdmiStatus',
  hdmi_cable: 'hdmiStatus',
  hdmistatus: 'hdmiStatus',
  pc_charge: 'chargerStatus',
  charger_status: 'chargerStatus',
  chargerstatus: 'chargerStatus',

  // Comments
  projector_comment: 'projectorComment',
  projectorcomment: 'projectorComment',
  speaker_comment: 'speakerComment',
  speakercomment: 'speakerComment',
  hdmi_comment: 'hdmiComment',
  hdmicomment: 'hdmiComment',
  pc_charge_comment: 'chargerComment',
  charger_comment: 'chargerComment',
  general_comment: 'generalComment',
  comment: 'generalComment',

  // Lamp
  lamp_hours: 'lampHours',
  lamphours: 'lampHours',
  remaining_life: 'lampLifeRemaining',
  lampliferemaining: 'lampLifeRemaining',
};

function mapRowHeaders(headers) {
  const result = {};
  headers.forEach((h, idx) => {
    const key = String(h || '').trim().toLowerCase().replace(/\s+/g, '_');
    const mapped = headerMap[key] || key; // allow direct exact key usage too
    result[idx] = mapped;
  });
  return result;
}

function toRecord(row, indexBy) {
  const rec = {};
  row.forEach((val, i) => {
    const key = indexBy[i];
    if (!key) return;
    rec[key] = val;
  });
  return rec;
}

async function main() {
  const debug = process.argv.includes('--debug') || process.env.DEBUG === '1';
  const filePath = process.argv.slice(2).join(' ').trim();
  if (!filePath) {
    console.error('Usage: npm run import:csv -- "C:\\path\\to\\file.csv"');
    process.exit(1);
  }
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  log(`Reading ${filePath}`);
  const parser = fs
    .createReadStream(filePath, { encoding: 'latin1' })
    .pipe(
      parse({
        delimiter: ';',
        relax_quotes: true,
        trim: true,
        skip_empty_lines: true,
        relax_column_count: true,
      })
    );

  let headerIndexed = null;
  let count = 0;
  let rowNum = 0;
  for await (const record of parser) {
    if (!headerIndexed) {
      headerIndexed = mapRowHeaders(record);
      if (debug) log(`Headers mapped: ${JSON.stringify(headerIndexed)}`);
      continue;
    }
    rowNum += 1;
    const raw = toRecord(record, headerIndexed);

    // Extract mapped fields with fallbacks
    const classroomName = (raw.classroomName || '').trim();
    const inspectorName = (raw.inspectorName || '').trim();
    const inspectionDate = parseDate(raw.inspectionDate || raw.date);

    // Normalize statuses
    const projectorStatus = normalizeStatus(raw.projectorStatus);
    const dustFilterStatus = normalizeStatus(raw.dustFilterStatus);
    const speakerStatus = normalizeStatus(raw.speakerStatus);
    const hdmiStatus = normalizeStatus(raw.hdmiStatus);
    const chargerStatus = normalizeStatus(raw.chargerStatus);

    if (debug) {
      log(`Row ${rowNum} mapped: statuses={ proj:${raw.projectorStatus}=>${projectorStatus}, dust:${raw.dustFilterStatus}=>${dustFilterStatus}, spk:${raw.speakerStatus}=>${speakerStatus}, hdmi:${raw.hdmiStatus}=>${hdmiStatus}, chr:${raw.chargerStatus}=>${chargerStatus} } names={classroom:${classroomName}, inspector:${inspectorName}} date=${raw.inspectionDate}`);
    }

    // Comments & lamp
    const projectorComment = raw.projectorComment || null;
    const lampHours = raw.lampHours || null;
    const lampLifeRemaining = raw.lampLifeRemaining || null;
    const speakerComment = raw.speakerComment || null;
    const hdmiComment = raw.hdmiComment || null;
    const chargerComment = raw.chargerComment || null;
    const generalComment = raw.generalComment || null;

    // Basic validations
    if (!classroomName || !inspectorName || !inspectionDate) {
      log(`Skipping row (missing classroomName/inspectorName/inspectionDate): ${JSON.stringify(raw)}`);
      continue;
    }
    if (!projectorStatus || !dustFilterStatus || !speakerStatus || !hdmiStatus || !chargerStatus) {
      log(`Skipping row (one or more statuses could not be normalized): ${JSON.stringify(raw)}`);
      continue;
    }

    // Upsert classroom & inspector by name
    const classroom = await prisma.classroom.upsert({
      where: { name: classroomName },
      update: {},
      create: { name: classroomName },
    });
    const inspector = await prisma.inspector.upsert({
      where: { name: inspectorName },
      update: {},
      create: { name: inspectorName },
    });

    // Upsert to avoid duplicates based on (classroomId, inspectorId, inspectionDate)
    await prisma.inspection.upsert({
      where: {
        classroomId_inspectorId_inspectionDate: {
          classroomId: classroom.id,
          inspectorId: inspector.id,
          inspectionDate,
        },
      },
      update: {
        projectorStatus,
        dustFilterStatus,
        speakerStatus,
        hdmiStatus,
        chargerStatus,
        projectorComment,
        lampHours,
        lampLifeRemaining,
        speakerComment,
        hdmiComment,
        chargerComment,
        generalComment,
      },
      create: {
        inspectionDate,
        classroomId: classroom.id,
        inspectorId: inspector.id,
        projectorStatus,
        dustFilterStatus,
        speakerStatus,
        hdmiStatus,
        chargerStatus,
        projectorComment,
        lampHours,
        lampLifeRemaining,
        speakerComment,
        hdmiComment,
        chargerComment,
        generalComment,
      },
    });

    count++;
    if (count % 50 === 0) log(`Imported ${count} rows...`);
  }

  log(`Done. Imported ${count} inspections.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
