/*
  Create/Replace the get_deduplicated_leads function.

  1) Drops the existing function if it exists.
  2) Recreates it with the exact parameter names 
     (p_filters JSONB, p_unlocked_ids TEXT[]).
  3) Applies deduplication logic.
  4) Grants EXECUTE to authenticated users.
  5) Creates some indexes for performance.
*/

/* 1. Drop existing function if it exists */
DROP FUNCTION IF EXISTS get_deduplicated_leads(JSONB, TEXT[]);

/* 2. Create the function with exact parameter names matching your code */
CREATE OR REPLACE FUNCTION get_deduplicated_leads(
  p_filters JSONB DEFAULT '{}'::jsonb,
  p_unlocked_ids TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS SETOF leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  where_conditions TEXT[];
  where_clause TEXT;
BEGIN
  -- Build WHERE conditions from filters
  where_conditions := ARRAY[]::TEXT[];
  
  --------------------------------------------------------------------
  -- 1) Each filter below appends a text fragment to where_conditions
  --------------------------------------------------------------------

  -- Region filter
  IF p_filters->>'region' IS NOT NULL THEN
    where_conditions := array_append(
      where_conditions, 
      format('region ILIKE %L', '%' || (p_filters->>'region') || '%')
    );
  END IF;

  -- State filter
  IF jsonb_array_length(p_filters->'state') > 0 THEN
    where_conditions := array_append(
      where_conditions,
      format('state = ANY(%L)',
        (SELECT array_agg(value::text) 
         FROM jsonb_array_elements_text(p_filters->'state')))
    );
  END IF;

  -- City filter
  IF jsonb_array_length(p_filters->'city') > 0 THEN
    where_conditions := array_append(
      where_conditions,
      format('city ILIKE ANY(%L)', 
        (SELECT array_agg('%' || value::text || '%') 
         FROM jsonb_array_elements_text(p_filters->'city')))
    );
  END IF;

  -- Industry filter
  IF jsonb_array_length(p_filters->'industry') > 0 THEN
    where_conditions := array_append(
      where_conditions,
      format('industry ILIKE ANY(%L)', 
        (SELECT array_agg('%' || value::text || '%') 
         FROM jsonb_array_elements_text(p_filters->'industry')))
    );
  END IF;

  -- Event format filter
  IF jsonb_array_length(p_filters->'eventFormat') > 0 THEN
    where_conditions := array_append(
      where_conditions,
      format('event_format ILIKE ANY(%L)', 
        (SELECT array_agg('%' || value::text || '%') 
         FROM jsonb_array_elements_text(p_filters->'eventFormat')))
    );
  END IF;

  -- Organization filter
  IF jsonb_array_length(p_filters->'organization') > 0 THEN
    where_conditions := array_append(
      where_conditions,
      format('organization ILIKE ANY(%L)', 
        (SELECT array_agg('%' || value::text || '%') 
         FROM jsonb_array_elements_text(p_filters->'organization')))
    );
  END IF;

  -- Organization type filter
  IF jsonb_array_length(p_filters->'organizationType') > 0 THEN
    where_conditions := array_append(
      where_conditions,
      format('organization_type = ANY(%L)', 
        (SELECT array_agg(value::text) 
         FROM jsonb_array_elements_text(p_filters->'organizationType')))
    );
  END IF;

  -- Job title filter
  IF jsonb_array_length(p_filters->'jobTitle') > 0 THEN
    where_conditions := array_append(
      where_conditions,
      format('job_title ILIKE ANY(%L)', 
        (SELECT array_agg('%' || value::text || '%') 
         FROM jsonb_array_elements_text(p_filters->'jobTitle')))
    );
  END IF;

  -- Past speakers filter
  IF jsonb_array_length(p_filters->'pastSpeakers') > 0 THEN
    where_conditions := array_append(
      where_conditions,
      format('past_speakers_events ILIKE ANY(%L)', 
        (SELECT array_agg('%' || value::text || '%') 
         FROM jsonb_array_elements_text(p_filters->'pastSpeakers')))
    );
  END IF;

  -- Search all filter
  IF p_filters->>'searchAll' IS NOT NULL THEN
    where_conditions := array_append(
      where_conditions,
      format('(lead_name ILIKE %L OR organization ILIKE %L OR job_title ILIKE %L OR event_name ILIKE %L)',
        '%' || (p_filters->>'searchAll') || '%',
        '%' || (p_filters->>'searchAll') || '%',
        '%' || (p_filters->>'searchAll') || '%',
        '%' || (p_filters->>'searchAll') || '%'
      )
    );
  END IF;

  -- Event name filter
  IF p_filters->>'event' IS NOT NULL THEN
    where_conditions := array_append(
      where_conditions,
      format('event_name ILIKE %L', '%' || (p_filters->>'event') || '%')
    );
  END IF;

  -- Unlock type filter
  IF p_filters->>'unlockType' IS NOT NULL THEN
    where_conditions := array_append(
      where_conditions,
      format('unlock_type = %L', p_filters->>'unlockType')
    );
  END IF;

  -- Exclude unlocked leads
  IF array_length(p_unlocked_ids, 1) > 0 THEN
    where_conditions := array_append(
      where_conditions,
      format('id != ALL(%L)', p_unlocked_ids)
    );
  END IF;

  --------------------------------------------------------------------
  -- 2) Combine conditions into a single string for the WHERE clause
  --------------------------------------------------------------------
  where_clause := array_to_string(where_conditions, ' AND ');
  IF where_clause != '' THEN
    where_clause := ' AND ' || where_clause;
  END IF;

  --------------------------------------------------------------------
  -- 3) Actual dedup logic with cte_contacts & cte_events
  --------------------------------------------------------------------
  RETURN QUERY EXECUTE format('
    WITH cte_contacts AS (
      SELECT
        leads.*,
        2 AS dedup_value  -- Mark all contacts as dedup_value=2
      FROM leads
      WHERE lead_type = ''Contact'' %s
    ),
    cte_events AS (
      SELECT
        leads.*,
        CASE
          -- 1) Event URL -> dedup_value=2
          WHEN COUNT(*) FILTER (WHERE unlock_type = ''Unlock Event URL'')
               OVER (PARTITION BY LOWER(TRIM(event_name)), LOWER(TRIM(organization))) > 0
               AND unlock_type = ''Unlock Event URL''
               AND id = FIRST_VALUE(id) OVER (
                 PARTITION BY LOWER(TRIM(event_name)), LOWER(TRIM(organization))
                 ORDER BY 
                   CASE WHEN unlock_type = ''Unlock Event URL'' THEN 0 ELSE 1 END,
                   created_at
                 RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
               )
          THEN 2

          -- 2) Tier 1 email patterns -> dedup_value=2 if no URL
          WHEN COUNT(*) FILTER (WHERE unlock_type = ''Unlock Event URL'')
               OVER (PARTITION BY LOWER(TRIM(event_name)), LOWER(TRIM(organization))) = 0
               AND unlock_type = ''Unlock Event Email''
               AND (
                 unlock_value ILIKE ANY(ARRAY[
                   ''%%event%%'', ''%%confer%%'', ''%%speak%%'', ''%%coach%%'',
                   ''%%consult%%'', ''%%train%%'', ''%%book%%'', ''%%present%%''
                 ])
               )
               AND id = FIRST_VALUE(id) OVER (
                 PARTITION BY LOWER(TRIM(event_name)), LOWER(TRIM(organization))
                 ORDER BY created_at
                 RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
               )
          THEN 2

          -- 3) Tier 2 email patterns -> dedup_value=1 if no URL/Tier1
          WHEN COUNT(*) FILTER (WHERE unlock_type = ''Unlock Event URL'')
               OVER (PARTITION BY LOWER(TRIM(event_name)), LOWER(TRIM(organization))) = 0
               AND COUNT(*) FILTER (
                 WHERE unlock_type = ''Unlock Event Email''
                 AND unlock_value ILIKE ANY(ARRAY[
                   ''%%event%%'', ''%%confer%%'', ''%%speak%%'', ''%%coach%%'',
                   ''%%consult%%'', ''%%train%%'', ''%%book%%'', ''%%present%%''
                 ])
               ) OVER (PARTITION BY LOWER(TRIM(event_name)), LOWER(TRIM(organization))) = 0
               AND unlock_type = ''Unlock Event Email''
               AND (
                 unlock_value ILIKE ANY(ARRAY[
                   ''%%info%%'', ''%%contact%%'', ''%%hello%%'',
                   ''%%support%%'', ''%%inquir%%''
                 ])
               )
               AND id = FIRST_VALUE(id) OVER (
                 PARTITION BY LOWER(TRIM(event_name)), LOWER(TRIM(organization))
                 ORDER BY created_at
                 RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
               )
          THEN 1

          -- 4) Any remaining email -> dedup_value=1 if no other matches
          WHEN COUNT(*) FILTER (WHERE unlock_type = ''Unlock Event URL'')
               OVER (PARTITION BY LOWER(TRIM(event_name)), LOWER(TRIM(organization))) = 0
               AND COUNT(*) FILTER (
                 WHERE unlock_type = ''Unlock Event Email''
                 AND (
                   unlock_value ILIKE ANY(ARRAY[
                     ''%%event%%'', ''%%confer%%'', ''%%speak%%'', ''%%coach%%'',
                     ''%%consult%%'', ''%%train%%'', ''%%book%%'', ''%%present%%'',
                     ''%%info%%'', ''%%contact%%'', ''%%hello%%'',
                     ''%%support%%'', ''%%inquir%%''
                   ])
                 )
               ) OVER (PARTITION BY LOWER(TRIM(event_name)), LOWER(TRIM(organization))) = 0
               AND unlock_type = ''Unlock Event Email''
               AND id = FIRST_VALUE(id) OVER (
                 PARTITION BY LOWER(TRIM(event_name)), LOWER(TRIM(organization))
                 ORDER BY created_at
                 RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
               )
          THEN 1

          -- Otherwise dedup_value=0
          ELSE 0
        END AS dedup_value
      FROM leads
      WHERE lead_type = ''Event'' %s
    )
    SELECT * FROM cte_contacts
    UNION ALL
    SELECT * FROM cte_events
    WHERE dedup_value > 0  -- Only return records with dedup_value > 0
    ORDER BY created_at DESC',
    where_clause,
    where_clause
  );
END;
$$;

/* 3. Grant EXECUTE on the function to "authenticated" role (Supabase default) */
GRANT EXECUTE ON FUNCTION get_deduplicated_leads(JSONB, TEXT[]) TO authenticated;

/* 4. Create helpful indexes */
CREATE INDEX IF NOT EXISTS idx_leads_event_name ON leads(event_name);
CREATE INDEX IF NOT EXISTS idx_leads_organization ON leads(organization);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_unlock_type ON leads(unlock_type);
CREATE INDEX IF NOT EXISTS idx_leads_unlock_value ON leads(unlock_value);
