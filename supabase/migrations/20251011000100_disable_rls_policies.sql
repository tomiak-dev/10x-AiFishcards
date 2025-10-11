-- ============================================================================
-- Migration: Disable RLS Policies
-- Description: Disables all Row Level Security policies created in the
--              initial schema migration (20251011000000_initial_schema.sql)
-- Author: PostgreSQL Expert
-- Date: 2025-10-11
-- ============================================================================
-- Tables affected:
--   - srs_algorithms (policies dropped)
--   - decks (policies dropped)
--   - flashcards (policies dropped)
--   - flashcard_srs_data (policies dropped)
--   - ai_generation_metrics (policies dropped)
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop policies for srs_algorithms table
-- ============================================================================

-- Drop the anon select policy for srs_algorithms
drop policy if exists "srs_algorithms_select_policy_for_anon" on srs_algorithms;

-- Drop the authenticated select policy for srs_algorithms
drop policy if exists "srs_algorithms_select_policy_for_authenticated" on srs_algorithms;

-- ============================================================================
-- STEP 2: Drop policies for decks table
-- ============================================================================

-- Drop the select policy for authenticated users on decks
drop policy if exists "decks_select_policy_for_authenticated" on decks;

-- Drop the insert policy for authenticated users on decks
drop policy if exists "decks_insert_policy_for_authenticated" on decks;

-- Drop the update policy for authenticated users on decks
drop policy if exists "decks_update_policy_for_authenticated" on decks;

-- Drop the delete policy for authenticated users on decks
drop policy if exists "decks_delete_policy_for_authenticated" on decks;

-- ============================================================================
-- STEP 3: Drop policies for flashcards table
-- ============================================================================

-- Drop the select policy for authenticated users on flashcards
drop policy if exists "flashcards_select_policy_for_authenticated" on flashcards;

-- Drop the insert policy for authenticated users on flashcards
drop policy if exists "flashcards_insert_policy_for_authenticated" on flashcards;

-- Drop the update policy for authenticated users on flashcards
drop policy if exists "flashcards_update_policy_for_authenticated" on flashcards;

-- Drop the delete policy for authenticated users on flashcards
drop policy if exists "flashcards_delete_policy_for_authenticated" on flashcards;

-- ============================================================================
-- STEP 4: Drop policies for flashcard_srs_data table
-- ============================================================================

-- Drop the select policy for authenticated users on flashcard_srs_data
drop policy if exists "flashcard_srs_data_select_policy_for_authenticated" on flashcard_srs_data;

-- Drop the insert policy for authenticated users on flashcard_srs_data
drop policy if exists "flashcard_srs_data_insert_policy_for_authenticated" on flashcard_srs_data;

-- Drop the update policy for authenticated users on flashcard_srs_data
drop policy if exists "flashcard_srs_data_update_policy_for_authenticated" on flashcard_srs_data;

-- Drop the delete policy for authenticated users on flashcard_srs_data
drop policy if exists "flashcard_srs_data_delete_policy_for_authenticated" on flashcard_srs_data;

-- ============================================================================
-- STEP 5: Drop policies for ai_generation_metrics table
-- ============================================================================

-- Drop the select policy for authenticated users on ai_generation_metrics
drop policy if exists "ai_generation_metrics_select_policy_for_authenticated" on ai_generation_metrics;

-- Drop the insert policy for authenticated users on ai_generation_metrics
drop policy if exists "ai_generation_metrics_insert_policy_for_authenticated" on ai_generation_metrics;

-- Drop the update policy for authenticated users on ai_generation_metrics
drop policy if exists "ai_generation_metrics_update_policy_for_authenticated" on ai_generation_metrics;

-- Drop the delete policy for authenticated users on ai_generation_metrics
drop policy if exists "ai_generation_metrics_delete_policy_for_authenticated" on ai_generation_metrics;

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- All RLS policies have been dropped from:
-- - srs_algorithms (2 policies dropped)
-- - decks (4 policies dropped)
-- - flashcards (4 policies dropped)
-- - flashcard_srs_data (4 policies dropped)
-- - ai_generation_metrics (4 policies dropped)
-- Total: 18 policies dropped
--
-- IMPORTANT: Row Level Security (RLS) is still ENABLED on all tables.
-- This means that without policies, no rows will be accessible to users
-- unless you either:
-- 1. Create new policies, or
-- 2. Disable RLS entirely with: ALTER TABLE table_name DISABLE ROW LEVEL SECURITY
-- ============================================================================

