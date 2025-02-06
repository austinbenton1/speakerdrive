-- Update the get_deduplicated_leads function to set contacts' chosen_flag to 2
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
  
  -- Apply filters
  IF p_filters->>'region' IS NOT NULL THEN
    where_conditions := array_append(
      where_conditions, 
      format('region ILIKE %L', '%' || (p_filters->>'region') || '%')
    );
  END IF;

  -- Build final where clause
  where_clause := array_to_string(where_conditions, ' AND ');
  IF where_clause != '' THEN
    where_clause := ' WHERE ' || where_clause;
  END IF;

  -- Execute the query with CTEs for contacts and events
  RETURN QUERY EXECUTE format('
    WITH cte_contacts AS (
      SELECT
        leads.*,
        2::int AS chosen_flag  -- Changed from NULL to 2
      FROM leads
      WHERE lead_type = ''Contact'' %s
    ),
    cte_events AS (
      SELECT
        leads.*,
        CASE
          WHEN COUNT(*) FILTER (WHERE unlock_type = ''Unlock Event URL'')
               OVER (PARTITION BY event_name) > 0
               AND unlock_type = ''Unlock Event URL''
          THEN 2

          WHEN COUNT(*) FILTER (WHERE unlock_type = ''Unlock Event URL'')
               OVER (PARTITION BY event_name) = 0
               AND unlock_type = ''Unlock Event Email''
               AND (
                 unlock_value ILIKE ANY(ARRAY[
                   ''%%event%%'', ''%%confer%%'', ''%%speak%%'', ''%%coach%%'',
                   ''%%consult%%'', ''%%train%%'', ''%%book%%'', ''%%present%%''
                 ])
               )
          THEN 2

          WHEN COUNT(*) FILTER (WHERE unlock_type = ''Unlock Event URL'')
               OVER (PARTITION BY event_name) = 0
               AND unlock_type = ''Unlock Event Email''
               AND (
                 unlock_value ILIKE ANY(ARRAY[
                   ''%%info%%'', ''%%contact%%'', ''%%hello%%'',
                   ''%%support%%'', ''%%inquir%%''
                 ])
               )
          THEN 1

          WHEN COUNT(*) FILTER (WHERE unlock_type = ''Unlock Event URL'')
               OVER (PARTITION BY event_name) = 0
               AND unlock_type = ''Unlock Event Email''
          THEN 1

          ELSE 0
        END AS chosen_flag
      FROM leads
      WHERE lead_type = ''Event'' %s
    )
    SELECT * FROM cte_contacts
    UNION ALL
    SELECT * FROM cte_events
    WHERE chosen_flag > 0
    ORDER BY created_at DESC',
    where_clause,
    where_clause
  );
END;
$$;