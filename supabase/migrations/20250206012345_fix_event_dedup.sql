-- Update deduplication logic to ensure single event selection
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
        2::int AS chosen_flag  -- All contacts get 2 now
      FROM leads
      WHERE lead_type = ''Contact'' %s
    ),
    cte_events AS (
      SELECT
        leads.*,
        CASE
          -- First priority: Take ONLY the EARLIEST URL if any URL exists
          WHEN leads.unlock_type = ''Unlock Event URL''
          AND NOT EXISTS (
              SELECT 1 FROM leads l3
              WHERE l3.event_name = leads.event_name
              AND l3.unlock_type = ''Unlock Event URL''
              AND l3.created_at < leads.created_at
          )
          THEN 2
          
          -- Second priority: Only consider emails if NO URLs exist for this event
          WHEN leads.unlock_type = ''Unlock Event Email''
          AND NOT EXISTS (
              SELECT 1 FROM leads l2 
              WHERE l2.event_name = leads.event_name 
              AND l2.unlock_type = ''Unlock Event URL''
          )
          AND (
              -- Check for tier 1 email patterns
              unlock_value ILIKE ANY(ARRAY[
                  ''%%event%%'', ''%%confer%%'', ''%%speak%%'', ''%%coach%%'',
                  ''%%consult%%'', ''%%train%%'', ''%%book%%'', ''%%present%%''
              ])
          )
          AND NOT EXISTS (
              -- Must be the earliest tier 1 match
              SELECT 1 FROM leads l3 
              WHERE l3.event_name = leads.event_name 
              AND l3.unlock_type = ''Unlock Event Email''
              AND l3.created_at < leads.created_at
              AND l3.unlock_value ILIKE ANY(ARRAY[
                  ''%%event%%'', ''%%confer%%'', ''%%speak%%'', ''%%coach%%'',
                  ''%%consult%%'', ''%%train%%'', ''%%book%%'', ''%%present%%''
              ])
          )
          THEN 2

          -- Third priority: Tier 2 email patterns if no URLs or tier 1 emails exist
          WHEN leads.unlock_type = ''Unlock Event Email''
          AND NOT EXISTS (
              SELECT 1 FROM leads l2 
              WHERE l2.event_name = leads.event_name 
              AND (
                  l2.unlock_type = ''Unlock Event URL''
                  OR (
                      l2.unlock_type = ''Unlock Event Email''
                      AND l2.unlock_value ILIKE ANY(ARRAY[
                          ''%%event%%'', ''%%confer%%'', ''%%speak%%'', ''%%coach%%'',
                          ''%%consult%%'', ''%%train%%'', ''%%book%%'', ''%%present%%''
                      ])
                  )
              )
          )
          AND (
              unlock_value ILIKE ANY(ARRAY[
                  ''%%info%%'', ''%%contact%%'', ''%%hello%%'',
                  ''%%support%%'', ''%%inquir%%''
              ])
          )
          AND NOT EXISTS (
              -- Must be the earliest tier 2 match
              SELECT 1 FROM leads l3 
              WHERE l3.event_name = leads.event_name 
              AND l3.unlock_type = ''Unlock Event Email''
              AND l3.created_at < leads.created_at
              AND l3.unlock_value ILIKE ANY(ARRAY[
                  ''%%info%%'', ''%%contact%%'', ''%%hello%%'',
                  ''%%support%%'', ''%%inquir%%''
              ])
          )
          THEN 2

          -- Final fallback: Earliest email if no other matches
          WHEN leads.unlock_type = ''Unlock Event Email''
          AND NOT EXISTS (
              SELECT 1 FROM leads l2 
              WHERE l2.event_name = leads.event_name 
              AND (
                  l2.unlock_type = ''Unlock Event URL''
                  OR (
                      l2.unlock_type = ''Unlock Event Email''
                      AND (
                          l2.unlock_value ILIKE ANY(ARRAY[
                              ''%%event%%'', ''%%confer%%'', ''%%speak%%'', ''%%coach%%'',
                              ''%%consult%%'', ''%%train%%'', ''%%book%%'', ''%%present%%''
                          ])
                          OR l2.unlock_value ILIKE ANY(ARRAY[
                              ''%%info%%'', ''%%contact%%'', ''%%hello%%'',
                              ''%%support%%'', ''%%inquir%%''
                          ])
                      )
                  )
              )
          )
          AND NOT EXISTS (
              -- Must be the earliest email
              SELECT 1 FROM leads l3 
              WHERE l3.event_name = leads.event_name 
              AND l3.unlock_type = ''Unlock Event Email''
              AND l3.created_at < leads.created_at
          )
          THEN 2
          
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
