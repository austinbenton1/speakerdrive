-- Function to update deduplication values based on new rules
CREATE OR REPLACE FUNCTION update_dedup_values(json_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    item jsonb;
    lead_id text;
    event_name text;
    organization text;
    lead_type text;
    unlock_type text;
    unlock_value text;
    created_at timestamptz;
    group_key text;
    has_url boolean;
    has_tier1_email boolean;
    has_tier2_email boolean;
    earliest_url_id text;
    earliest_tier1_id text;
    earliest_tier2_id text;
    earliest_email_id text;
BEGIN
    -- First, reset all dedup values to 1
    UPDATE leads SET dedup_value = 1;

    -- Process each group
    FOR item IN SELECT * FROM jsonb_array_elements(json_data)
    LOOP
        -- Get the event name and organization for this group
        SELECT 
            LOWER(TRIM(l.event_name)), 
            LOWER(TRIM(l.organization))
        INTO 
            event_name, 
            organization
        FROM leads l
        WHERE l.id = (item->>'unique_ids'->0)::text
        LIMIT 1;

        group_key := event_name || '|' || organization;

        -- Get all leads in this group
        FOR lead_id, lead_type, unlock_type, unlock_value, created_at IN
            SELECT 
                l.id,
                l.lead_type,
                l.unlock_type,
                l.unlock_value,
                l.created_at
            FROM leads l
            WHERE LOWER(TRIM(l.event_name)) = event_name
            AND LOWER(TRIM(l.organization)) = organization
        LOOP
            -- Handle Contact leads - all are kept
            IF lead_type = 'Contact' THEN
                UPDATE leads SET dedup_value = 2 WHERE id = lead_id;
                CONTINUE;
            END IF;

            -- Handle Event leads
            IF lead_type = 'Event' THEN
                -- Check for URL unlock
                IF unlock_type = 'Unlock Event URL' THEN
                    -- Track earliest URL record
                    IF earliest_url_id IS NULL OR created_at < (
                        SELECT created_at FROM leads WHERE id = earliest_url_id
                    ) THEN
                        earliest_url_id := lead_id;
                    END IF;
                END IF;

                -- Check for Email unlock with Tier 1 patterns
                IF unlock_type = 'Unlock Event Email' AND (
                    unlock_value ILIKE ANY(ARRAY[
                        '%event%', '%confer%', '%speak%', '%coach%', 
                        '%consult%', '%train%', '%book%', '%present%'
                    ])
                ) THEN
                    -- Track earliest Tier 1 email record
                    IF earliest_tier1_id IS NULL OR created_at < (
                        SELECT created_at FROM leads WHERE id = earliest_tier1_id
                    ) THEN
                        earliest_tier1_id := lead_id;
                    END IF;
                END IF;

                -- Check for Email unlock with Tier 2 patterns
                IF unlock_type = 'Unlock Event Email' AND (
                    unlock_value ILIKE ANY(ARRAY[
                        '%info%', '%contact%', '%hello%', 
                        '%support%', '%inquir%'
                    ])
                ) THEN
                    -- Track earliest Tier 2 email record
                    IF earliest_tier2_id IS NULL OR created_at < (
                        SELECT created_at FROM leads WHERE id = earliest_tier2_id
                    ) THEN
                        earliest_tier2_id := lead_id;
                    END IF;
                END IF;

                -- Track earliest email record (any)
                IF unlock_type = 'Unlock Event Email' THEN
                    IF earliest_email_id IS NULL OR created_at < (
                        SELECT created_at FROM leads WHERE id = earliest_email_id
                    ) THEN
                        earliest_email_id := lead_id;
                    END IF;
                END IF;
            END IF;
        END LOOP;

        -- Apply deduplication flags based on priority
        IF earliest_url_id IS NOT NULL THEN
            -- Highest priority: Event URL
            UPDATE leads SET dedup_value = 2 WHERE id = earliest_url_id;
        ELSIF earliest_tier1_id IS NOT NULL THEN
            -- High priority: Tier 1 email patterns
            UPDATE leads SET dedup_value = 2 WHERE id = earliest_tier1_id;
        ELSIF earliest_tier2_id IS NOT NULL THEN
            -- Lower priority: Tier 2 email patterns
            UPDATE leads SET dedup_value = 1 WHERE id = earliest_tier2_id;
        ELSIF earliest_email_id IS NOT NULL THEN
            -- Lowest priority: Any email
            UPDATE leads SET dedup_value = 1 WHERE id = earliest_email_id;
        END IF;

        -- Reset variables for next group
        earliest_url_id := NULL;
        earliest_tier1_id := NULL;
        earliest_tier2_id := NULL;
        earliest_email_id := NULL;
    END LOOP;
END;
$$;