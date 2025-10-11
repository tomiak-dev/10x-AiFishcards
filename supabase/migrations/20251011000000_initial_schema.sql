-- ============================================================================
-- Migration: Initial Schema for 10xdevsFishcards
-- Description: Creates the complete database schema for a flashcard learning
--              application with SRS (Spaced Repetition System) support
-- Author: PostgreSQL Expert
-- Date: 2025-10-11
-- ============================================================================
-- Tables affected:
--   - srs_algorithms (new)
--   - decks (new)
--   - flashcards (new)
--   - flashcard_srs_data (new)
--   - ai_generation_metrics (new)
-- Views affected:
--   - flashcards_with_srs (new)
-- Functions affected:
--   - create_flashcard_srs_data() (new)
--   - update_srs_data_on_review() (new)
-- ============================================================================

-- ============================================================================
-- STEP 1: Create custom ENUM types
-- ============================================================================

-- Defines the source of flashcard creation: manual, ai-generated, or ai-edited
create type creation_source_enum as enum ('manual', 'ai_generated', 'ai_generated_edited');

-- Defines the quality of user review during learning sessions
-- Maps to SM-2 algorithm quality values: again=0, good=4, easy=5
create type review_quality_enum as enum ('again', 'good', 'easy');

-- ============================================================================
-- STEP 2: Create srs_algorithms table (dictionary table)
-- ============================================================================

-- Stores available Spaced Repetition System algorithms
-- This is a dictionary table that can be extended in the future
create table srs_algorithms (
    id smallserial primary key,
    name text not null unique
);

-- Enable RLS for srs_algorithms table
-- This table contains reference data that should be read-only for users
alter table srs_algorithms enable row level security;

-- Allow all users (authenticated and anonymous) to read SRS algorithms
-- This is reference data needed for the application to function
create policy "srs_algorithms_select_policy_for_anon"
    on srs_algorithms
    for select
    to anon
    using (true);

create policy "srs_algorithms_select_policy_for_authenticated"
    on srs_algorithms
    for select
    to authenticated
    using (true);

-- Insert the default SM-2 algorithm
-- SM-2 is the classic spaced repetition algorithm created by Piotr Wozniak
insert into srs_algorithms (name) values ('SM-2');

-- ============================================================================
-- STEP 3: Create decks table
-- ============================================================================

-- Stores flashcard decks created by users
-- Each deck is owned by a single user and contains multiple flashcards
create table decks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    name text not null,
    created_at timestamptz not null default now(),
    last_reviewed_at timestamptz default now()
);

-- Index to speed up queries filtering by user_id
-- This is critical as most deck queries will filter by the authenticated user
create index idx_decks_user_id on decks(user_id);

-- Enable RLS for decks table
-- Users should only access their own decks
alter table decks enable row level security;

-- Allow authenticated users to select only their own decks
create policy "decks_select_policy_for_authenticated"
    on decks
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Allow authenticated users to insert decks for themselves
create policy "decks_insert_policy_for_authenticated"
    on decks
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Allow authenticated users to update only their own decks
create policy "decks_update_policy_for_authenticated"
    on decks
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Allow authenticated users to delete only their own decks
-- WARNING: This will cascade delete all flashcards in the deck
create policy "decks_delete_policy_for_authenticated"
    on decks
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: Create flashcards table
-- ============================================================================

-- Stores individual flashcards belonging to decks
-- Each flashcard has a front (question) and back (answer)
create table flashcards (
    id uuid primary key default gen_random_uuid(),
    deck_id uuid not null references decks(id) on delete cascade,
    front text not null check (length(front) <= 200),
    back text not null check (length(back) <= 500),
    created_at timestamptz not null default now(),
    changed_at timestamptz,
    creation_source creation_source_enum not null default 'manual'
);

-- Index to speed up queries filtering by deck_id
-- Essential for fetching all flashcards in a specific deck
create index idx_flashcards_deck_id on flashcards(deck_id);

-- Enable RLS for flashcards table
-- Users should only access flashcards in their own decks
alter table flashcards enable row level security;

-- Allow authenticated users to select flashcards from their own decks
create policy "flashcards_select_policy_for_authenticated"
    on flashcards
    for select
    to authenticated
    using (
        exists (
            select 1 from decks
            where decks.id = flashcards.deck_id and decks.user_id = auth.uid()
        )
    );

-- Allow authenticated users to insert flashcards into their own decks
create policy "flashcards_insert_policy_for_authenticated"
    on flashcards
    for insert
    to authenticated
    with check (
        exists (
            select 1 from decks
            where decks.id = flashcards.deck_id and decks.user_id = auth.uid()
        )
    );

-- Allow authenticated users to update flashcards in their own decks
create policy "flashcards_update_policy_for_authenticated"
    on flashcards
    for update
    to authenticated
    using (
        exists (
            select 1 from decks
            where decks.id = flashcards.deck_id and decks.user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from decks
            where decks.id = flashcards.deck_id and decks.user_id = auth.uid()
        )
    );

-- Allow authenticated users to delete flashcards from their own decks
-- WARNING: This will cascade delete the associated SRS data
create policy "flashcards_delete_policy_for_authenticated"
    on flashcards
    for delete
    to authenticated
    using (
        exists (
            select 1 from decks
            where decks.id = flashcards.deck_id and decks.user_id = auth.uid()
        )
    );

-- ============================================================================
-- STEP 5: Create flashcard_srs_data table
-- ============================================================================

-- Stores SRS (Spaced Repetition System) data for each flashcard
-- This table maintains the learning progress and scheduling information
create table flashcard_srs_data (
    flashcard_id uuid primary key references flashcards(id) on delete cascade,
    srs_algorithm_id smallint not null default 1 references srs_algorithms(id),
    due_date date not null default current_date,
    interval smallint not null default 0 check (interval >= 0),
    repetition smallint not null default 0 check (repetition >= 0),
    efactor numeric(4, 2) not null default 2.5 check (efactor >= 1.3)
);

-- Index to speed up queries filtering by due_date
-- Critical for finding flashcards that are due for review
create index idx_flashcard_srs_data_due_date on flashcard_srs_data(due_date);

-- Enable RLS for flashcard_srs_data table
-- Users should only access SRS data for their own flashcards
alter table flashcard_srs_data enable row level security;

-- Allow authenticated users to select SRS data for flashcards in their own decks
create policy "flashcard_srs_data_select_policy_for_authenticated"
    on flashcard_srs_data
    for select
    to authenticated
    using (
        exists (
            select 1 from flashcards f
            join decks d on f.deck_id = d.id
            where f.id = flashcard_srs_data.flashcard_id and d.user_id = auth.uid()
        )
    );

-- Allow authenticated users to insert SRS data for flashcards in their own decks
-- Note: This is typically handled by the trigger, but policy is needed for explicit inserts
create policy "flashcard_srs_data_insert_policy_for_authenticated"
    on flashcard_srs_data
    for insert
    to authenticated
    with check (
        exists (
            select 1 from flashcards f
            join decks d on f.deck_id = d.id
            where f.id = flashcard_srs_data.flashcard_id and d.user_id = auth.uid()
        )
    );

-- Allow authenticated users to update SRS data for flashcards in their own decks
create policy "flashcard_srs_data_update_policy_for_authenticated"
    on flashcard_srs_data
    for update
    to authenticated
    using (
        exists (
            select 1 from flashcards f
            join decks d on f.deck_id = d.id
            where f.id = flashcard_srs_data.flashcard_id and d.user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from flashcards f
            join decks d on f.deck_id = d.id
            where f.id = flashcard_srs_data.flashcard_id and d.user_id = auth.uid()
        )
    );

-- Allow authenticated users to delete SRS data for flashcards in their own decks
-- WARNING: This should rarely be needed as cascade delete handles cleanup
create policy "flashcard_srs_data_delete_policy_for_authenticated"
    on flashcard_srs_data
    for delete
    to authenticated
    using (
        exists (
            select 1 from flashcards f
            join decks d on f.deck_id = d.id
            where f.id = flashcard_srs_data.flashcard_id and d.user_id = auth.uid()
        )
    );

-- ============================================================================
-- STEP 6: Create ai_generation_metrics table
-- ============================================================================

-- Logs metrics for AI flashcard generation usage
-- Tracks how many flashcards were proposed, accepted, and edited by users
create table ai_generation_metrics (
    id bigserial primary key,
    user_id uuid not null references auth.users(id),
    created_at timestamptz not null default now(),
    proposed_flashcards_count integer not null check (proposed_flashcards_count >= 0),
    accepted_flashcards_count integer check (accepted_flashcards_count >= 0),
    edited_flashcards_count integer check (edited_flashcards_count >= 0)
);

-- Index to speed up queries filtering by user_id
-- Useful for generating user-specific analytics
create index idx_ai_generation_metrics_user_id on ai_generation_metrics(user_id);

-- Enable RLS for ai_generation_metrics table
-- Users should only access their own generation metrics
alter table ai_generation_metrics enable row level security;

-- Allow authenticated users to select only their own metrics
create policy "ai_generation_metrics_select_policy_for_authenticated"
    on ai_generation_metrics
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Allow authenticated users to insert metrics for themselves
create policy "ai_generation_metrics_insert_policy_for_authenticated"
    on ai_generation_metrics
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Allow authenticated users to update only their own metrics
create policy "ai_generation_metrics_update_policy_for_authenticated"
    on ai_generation_metrics
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Allow authenticated users to delete only their own metrics
create policy "ai_generation_metrics_delete_policy_for_authenticated"
    on ai_generation_metrics
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- ============================================================================
-- STEP 7: Create function to automatically initialize SRS data
-- ============================================================================

-- Automatically creates an entry in flashcard_srs_data when a new flashcard is inserted
-- This ensures every flashcard has SRS data initialized with default values
create or replace function create_flashcard_srs_data()
returns trigger as $$
begin
    insert into flashcard_srs_data (flashcard_id) values (new.id);
    return null;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- STEP 8: Create trigger to invoke SRS data initialization
-- ============================================================================

-- Trigger that fires after a flashcard is inserted
-- Automatically calls create_flashcard_srs_data() to initialize SRS data
create trigger on_flashcard_insert
    after insert on flashcards
    for each row execute function create_flashcard_srs_data();

-- ============================================================================
-- STEP 9: Create function to update SRS data based on review
-- ============================================================================

-- Implements the SM-2 algorithm to update SRS data based on user review quality
-- Parameters:
--   p_flashcard_id: UUID of the flashcard being reviewed
--   p_quality: User's quality rating (again, good, easy)
-- The function updates interval, repetition, efactor, and due_date
-- It also updates the last_reviewed_at timestamp for the deck
create or replace function update_srs_data_on_review(p_flashcard_id uuid, p_quality review_quality_enum)
returns void as $$
declare
    srs_data flashcard_srs_data;
    quality_val smallint;
begin
    -- Map the review quality enum to SM-2 algorithm quality values
    -- again = 0 (incorrect response)
    -- good = 4 (correct response with hesitation)
    -- easy = 5 (perfect response)
    quality_val := case p_quality
        when 'again' then 0
        when 'good' then 4
        when 'easy' then 5
    end;

    -- Fetch the current SRS data for the flashcard
    select * into srs_data from flashcard_srs_data where flashcard_id = p_flashcard_id;

    -- If quality is less than 3 (user said "again"), reset repetition and interval
    if quality_val < 3 then
        srs_data.repetition := 0;
        srs_data.interval := 1;
    else
        -- Calculate interval based on repetition count (SM-2 algorithm)
        if srs_data.repetition = 0 then
            srs_data.interval := 1;
        elsif srs_data.repetition = 1 then
            srs_data.interval := 6;
        else
            -- For subsequent repetitions, multiply by efactor
            srs_data.interval := ceil(srs_data.interval * srs_data.efactor);
        end if;

        -- Increment repetition count
        srs_data.repetition := srs_data.repetition + 1;
    end if;

    -- Update the easiness factor (efactor) based on quality
    -- Formula from SM-2: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    -- Minimum efactor is 1.3
    srs_data.efactor := greatest(1.3, srs_data.efactor + 0.1 - (5 - quality_val) * (0.08 + (5 - quality_val) * 0.02));

    -- Calculate the next due date by adding interval to current date
    srs_data.due_date := current_date + srs_data.interval;

    -- Update the flashcard_srs_data table with new values
    update flashcard_srs_data
    set
        repetition = srs_data.repetition,
        interval = srs_data.interval,
        efactor = srs_data.efactor,
        due_date = srs_data.due_date
    where flashcard_id = p_flashcard_id;

    -- Update the last_reviewed_at timestamp for the deck
    update decks d
    set last_reviewed_at = now()
    from flashcards f
    where d.id = f.deck_id and f.id = p_flashcard_id;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- STEP 10: Create flashcards_with_srs view
-- ============================================================================

-- Simplifies queries by joining flashcards with their SRS data and user info
-- This view is commonly used in the application to fetch flashcards with learning data
create or replace view flashcards_with_srs as
select
    f.id,
    f.deck_id,
    f.front,
    f.back,
    f.created_at,
    f.creation_source,
    d.user_id,
    srs.due_date,
    srs.interval,
    srs.repetition,
    srs.efactor
from
    flashcards f
join
    decks d on f.deck_id = d.id
join
    flashcard_srs_data srs on f.id = srs.flashcard_id;

-- Enable RLS for the view
-- Users should only see flashcards from their own decks
alter view flashcards_with_srs set (security_invoker = true);

-- Note: Views with security_invoker=true automatically inherit RLS policies
-- from the underlying tables, so users will only see their own flashcards

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- This migration creates a complete flashcard learning system with:
-- - User-owned decks and flashcards
-- - SRS (SM-2 algorithm) for spaced repetition learning
-- - AI generation metrics tracking
-- - Comprehensive RLS policies for data security
-- - Automatic SRS data initialization via triggers
-- - Helper view for simplified queries
-- ============================================================================

