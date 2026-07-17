-- ============================================================
-- Add student_ids column to receipts table
-- This enables linking receipts to multiple students.
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

ALTER TABLE receipts
  ADD COLUMN IF NOT EXISTS student_ids jsonb DEFAULT '[]'::jsonb;
