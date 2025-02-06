DROP FUNCTION IF EXISTS get_deduplicated_leads;

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
  ------------------------------------------------------------------------------
  -- 1) Build an optional WHERE clause from p_filters (e.g. region, etc.)
  ------------------------------------------------------------------------------
  where_conditions := ARRAY[]::TEXT[];

  IF p_filters->>'region' IS NOT NULL THEN
    where_conditions := array_append(
      where_conditions, 
      format('region ILIKE %L', '%' || (p_filters->>'region') || '%')
    );
  END IF;

  where_clause := array_to_string(where_conditions, ' AND ');
  IF where_clause <> '' THEN
    where_clause := ' WHERE ' || where_clause;
  END IF;

  ------------------------------------------------------------------------------
  -- 2) Return all contacts plus deduplicated events
  --    - Distinct ON (event_name)
  --    - URL has priority over email
  --    - Among multiple emails, pick the earliest row matching sub-priorities.
  ------------------------------------------------------------------------------
  RETURN QUERY EXECUTE format($SQL$
    WITH deduped_events AS (
      SELECT DISTINCT ON (event_name) *
      FROM leads
      WHERE lead_type = 'Event'
        AND unlock_type IN ('Unlock Event URL', 'Unlock Event Email')
        %s
      ORDER BY
        -- Partition by event_name
        event_name,

        -- Priority #1: URL (0) vs Email (1)
        CASE WHEN unlock_type = 'Unlock Event URL' THEN 0
             ELSE 1
        END,

        -- Priority #2 (sub-priority among emails):
        CASE
          WHEN unlock_type = 'Unlock Event Email'
               AND unlock_value ILIKE ANY(ARRAY[
                 '%%event%%','%%confer%%','%%speak%%','%%coach%%',
                 '%%consult%%','%%train%%','%%book%%','%%present%%'
               ])
          THEN 1
          WHEN unlock_type = 'Unlock Event Email'
               AND unlock_value ILIKE ANY(ARRAY[
                 '%%info%%','%%contact%%','%%hello%%',
                 '%%support%%','%%inquir%%'
               ])
          THEN 2
          WHEN unlock_type = 'Unlock Event Email'
          THEN 3
        END,

        -- Final tie-break: earliest created_at
        created_at
    )
    SELECT
      *
    FROM leads
    WHERE lead_type = 'Contact'  -- all contacts
      %s

    UNION ALL

    SELECT
      *
    FROM deduped_events

    ORDER BY created_at DESC
  $SQL$, where_clause, where_clause);

END;
$$;
