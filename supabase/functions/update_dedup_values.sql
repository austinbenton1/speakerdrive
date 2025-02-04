-- Function to update deduplication values based on JSON input
CREATE OR REPLACE FUNCTION update_dedup_values(json_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    item jsonb;
    unique_id text;
    related_id text;
BEGIN
    -- First, reset dedup_value to 1 for all leads that will be processed
    WITH all_leads AS (
        SELECT DISTINCT jsonb_array_elements_text(items.item->'related') as lead_id
        FROM jsonb_array_elements(json_data) as items(item)
    )
    UPDATE leads 
    SET dedup_value = 1
    WHERE id IN (SELECT lead_id FROM all_leads);

    -- Then set dedup_value = 2 for unique leads and update related_leads count
    FOR item IN SELECT * FROM jsonb_array_elements(json_data)
    LOOP
        -- Set dedup_value = 2 for all unique leads in this group
        FOR unique_id IN SELECT * FROM jsonb_array_elements_text(item->'unique_ids')
        LOOP
            UPDATE leads 
            SET dedup_value = 2
            WHERE id = unique_id;
        END LOOP;

        -- Update related_leads count for all leads in the group
        FOR related_id IN SELECT * FROM jsonb_array_elements_text(item->'related')
        LOOP
            UPDATE leads 
            SET related_leads = (item->>'related_number')::integer
            WHERE id = related_id;
        END LOOP;
    END LOOP;
END;
$$;
