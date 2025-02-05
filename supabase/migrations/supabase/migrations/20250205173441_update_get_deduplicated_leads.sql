CREATE OR REPLACE FUNCTION public.get_deduplicated_leads(
  p_filters JSONB DEFAULT '{}'::jsonb,
  p_unlocked_ids TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS TABLE (
    lead_name varchar,
    focus varchar,
    image_url varchar,
    lead_type varchar,
    unlock_type varchar,
    unlock_value varchar,
    industry varchar,
    organization varchar,
    event_name varchar,
    event_info text,
    detailed_info text,
    region varchar,
    past_speakers_events varchar,
    created_at timestamptz,
    event_url varchar,
    id varchar,
    event_format varchar,
    info_url varchar,
    organization_type varchar,
    tooltip_event_format text,
    tooltip_organization_type text,
    tooltip_location text,
    tooltip_organization text,
    tooltip_industry_category text,
    image_persistence boolean,
    value_profile varchar,
    outreach_pathways varchar,
    job_title varchar,
    subtext varchar,
    state varchar,
    city varchar,
    keywords varchar,
    dedup_value integer,
    related_leads integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY 
    WITH cte_contacts AS (
        SELECT
            l.lead_name,
            l.focus,
            l.image_url,
            l.lead_type,
            l.unlock_type,
            l.unlock_value,
            l.industry,
            l.organization,
            l.event_name,
            l.event_info,
            l.detailed_info,
            l.region,
            l.past_speakers_events,
            l.created_at,
            l.event_url,
            l.id,
            l.event_format,
            l.info_url,
            l.organization_type,
            l.tooltip_event_format,
            l.tooltip_organization_type,
            l.tooltip_location,
            l.tooltip_organization,
            l.tooltip_industry_category,
            l.image_persistence,
            l.value_profile,
            l.outreach_pathways,
            l.job_title,
            l.subtext,
            l.state,
            l.city,
            l.keywords,
            2::integer as dedup_value,
            l.related_leads
        FROM leads l
        WHERE l.lead_type = 'Contact'
    ),
    cte_events AS (
        SELECT
            l.lead_name,
            l.focus,
            l.image_url,
            l.lead_type,
            l.unlock_type,
            l.unlock_value,
            l.industry,
            l.organization,
            l.event_name,
            l.event_info,
            l.detailed_info,
            l.region,
            l.past_speakers_events,
            l.created_at,
            l.event_url,
            l.id,
            l.event_format,
            l.info_url,
            l.organization_type,
            l.tooltip_event_format,
            l.tooltip_organization_type,
            l.tooltip_location,
            l.tooltip_organization,
            l.tooltip_industry_category,
            l.image_persistence,
            l.value_profile,
            l.outreach_pathways,
            l.job_title,
            l.subtext,
            l.state,
            l.city,
            l.keywords,
            CASE
                WHEN COUNT(*) FILTER (WHERE l.unlock_type = 'Unlock Event URL')
                     OVER (PARTITION BY LOWER(TRIM(l.event_name)), LOWER(TRIM(l.organization))) > 0
                     AND l.unlock_type = 'Unlock Event URL'
                     AND l.id = FIRST_VALUE(l.id) OVER (
                         PARTITION BY LOWER(TRIM(l.event_name)), LOWER(TRIM(l.organization))
                         ORDER BY 
                             CASE WHEN l.unlock_type = 'Unlock Event URL' THEN 0 ELSE 1 END,
                             l.created_at
                         RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
                     )
                THEN 2
                WHEN COUNT(*) FILTER (WHERE l.unlock_type = 'Unlock Event URL')
                     OVER (PARTITION BY LOWER(TRIM(l.event_name)), LOWER(TRIM(l.organization))) = 0
                     AND l.unlock_type = 'Unlock Event Email'
                     AND (
                         l.unlock_value ILIKE ANY(ARRAY['%event%', '%confer%', '%speak%', '%coach%', 
                             '%consult%', '%train%', '%book%', '%present%'])
                     )
                     AND l.id = FIRST_VALUE(l.id) OVER (
                         PARTITION BY LOWER(TRIM(l.event_name)), LOWER(TRIM(l.organization))
                         ORDER BY l.created_at
                         RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
                     )
                THEN 2
                WHEN COUNT(*) FILTER (WHERE l.unlock_type = 'Unlock Event URL')
                     OVER (PARTITION BY LOWER(TRIM(l.event_name)), LOWER(TRIM(l.organization))) = 0
                     AND COUNT(*) FILTER (
                         WHERE l.unlock_type = 'Unlock Event Email'
                         AND l.unlock_value ILIKE ANY(ARRAY['%event%', '%confer%', '%speak%', '%coach%',
                             '%consult%', '%train%', '%book%', '%present%'])
                     ) OVER (PARTITION BY LOWER(TRIM(l.event_name)), LOWER(TRIM(l.organization))) = 0
                     AND l.unlock_type = 'Unlock Event Email'
                     AND (
                         l.unlock_value ILIKE ANY(ARRAY['%info%', '%contact%', '%hello%',
                             '%support%', '%inquir%'])
                     )
                     AND l.id = FIRST_VALUE(l.id) OVER (
                         PARTITION BY LOWER(TRIM(l.event_name)), LOWER(TRIM(l.organization))
                         ORDER BY l.created_at
                         RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
                     )
                THEN 1
                WHEN COUNT(*) FILTER (WHERE l.unlock_type = 'Unlock Event URL')
                     OVER (PARTITION BY LOWER(TRIM(l.event_name)), LOWER(TRIM(l.organization))) = 0
                     AND COUNT(*) FILTER (
                         WHERE l.unlock_type = 'Unlock Event Email'
                         AND l.unlock_value ILIKE ANY(ARRAY['%event%', '%confer%', '%speak%', '%coach%',
                             '%consult%', '%train%', '%book%', '%present%', '%info%', '%contact%', 
                             '%hello%', '%support%', '%inquir%'])
                     ) OVER (PARTITION BY LOWER(TRIM(l.event_name)), LOWER(TRIM(l.organization))) = 0
                     AND l.unlock_type = 'Unlock Event Email'
                     AND l.id = FIRST_VALUE(l.id) OVER (
                         PARTITION BY LOWER(TRIM(l.event_name)), LOWER(TRIM(l.organization))
                         ORDER BY l.created_at
                         RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
                     )
                THEN 1
                ELSE 0
            END::integer as dedup_value,
            l.related_leads
        FROM leads l
        WHERE l.lead_type = 'Event'
    )
    SELECT * FROM cte_contacts
    UNION ALL
    SELECT * FROM cte_events e
    WHERE e.dedup_value > 0
    ORDER BY created_at DESC;
END;
$$;

/* Grant EXECUTE to authenticated users */
GRANT EXECUTE ON FUNCTION get_deduplicated_leads(JSONB, TEXT[]) TO authenticated;
