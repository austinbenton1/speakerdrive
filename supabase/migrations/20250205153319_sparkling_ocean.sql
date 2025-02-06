@@ .. @@
         SELECT 
             LOWER(TRIM(l.event_name)), 
             LOWER(TRIM(l.organization))
+        INTO STRICT  -- Add STRICT to raise error if no rows found
         INTO 
             event_name, 
             organization
         FROM leads l
-        WHERE l.id = (item->>'unique_ids'->0)::text
+        WHERE l.id = (item->'unique_ids'->0->>'value')::text
         LIMIT 1;
 
+        -- Skip if event name or organization is NULL/empty
+        IF event_name IS NULL OR organization IS NULL THEN
+            CONTINUE;
+        END IF;
+
         group_key := event_name || '|' || organization;
 
         -- Get all leads in this group
@@ .. @@
                 l.created_at
             FROM leads l
             WHERE LOWER(TRIM(l.event_name)) = event_name
-            AND LOWER(TRIM(l.organization)) = organization
+              AND LOWER(TRIM(l.organization)) = organization
+            ORDER BY l.created_at ASC  -- Order by creation date for better performance
         LOOP
@@ .. @@
                 -- Check for URL unlock
                 IF unlock_type = 'Unlock Event URL' THEN
                     -- Track earliest URL record
-                    IF earliest_url_id IS NULL OR created_at < (
-                        SELECT created_at FROM leads WHERE id = earliest_url_id
-                    ) THEN
+                    IF earliest_url_id IS NULL OR 
+                       created_at < COALESCE((SELECT created_at FROM leads WHERE id = earliest_url_id), 'infinity'::timestamptz) THEN
                         earliest_url_id := lead_id;
                     END IF;
                 END IF;
@@ .. @@
                     ])
                 ) THEN
                     -- Track earliest Tier 1 email record
-                    IF earliest_tier1_id IS NULL OR created_at < (
-                        SELECT created_at FROM leads WHERE id = earliest_tier1_id
-                    ) THEN
+                    IF earliest_tier1_id IS NULL OR 
+                       created_at < COALESCE((SELECT created_at FROM leads WHERE id = earliest_tier1_id), 'infinity'::timestamptz) THEN
                         earliest_tier1_id := lead_id;
                     END IF;
                 END IF;
@@ .. @@
                     ])
                 ) THEN
                     -- Track earliest Tier 2 email record
-                    IF earliest_tier2_id IS NULL OR created_at < (
-                        SELECT created_at FROM leads WHERE id = earliest_tier2_id
-                    ) THEN
+                    IF earliest_tier2_id IS NULL OR 
+                       created_at < COALESCE((SELECT created_at FROM leads WHERE id = earliest_tier2_id), 'infinity'::timestamptz) THEN
                         earliest_tier2_id := lead_id;
                     END IF;
                 END IF;
@@ .. @@
                 -- Track earliest email record (any)
                 IF unlock_type = 'Unlock Event Email' THEN
-                    IF earliest_email_id IS NULL OR created_at < (
-                        SELECT created_at FROM leads WHERE id = earliest_email_id
-                    ) THEN
+                    IF earliest_email_id IS NULL OR 
+                       created_at < COALESCE((SELECT created_at FROM leads WHERE id = earliest_email_id), 'infinity'::timestamptz) THEN
                         earliest_email_id := lead_id;
                     END IF;
                 END IF;
@@ .. @@
     END LOOP;
+
+    -- Create indexes if they don't exist
+    CREATE INDEX IF NOT EXISTS idx_leads_event_name ON leads(event_name);
+    CREATE INDEX IF NOT EXISTS idx_leads_organization ON leads(organization);
+    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
+    CREATE INDEX IF NOT EXISTS idx_leads_unlock_type ON leads(unlock_type);
+    CREATE INDEX IF NOT EXISTS idx_leads_unlock_value ON leads(unlock_value);
 END;
 $$;