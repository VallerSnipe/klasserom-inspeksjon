-- Add composite unique constraint to prevent duplicate inspections per (classroom, inspector, date)
ALTER TABLE "Inspection"
ADD CONSTRAINT "Inspection_classroomId_inspectorId_inspectionDate_key"
UNIQUE ("classroomId", "inspectorId", "inspectionDate");
