# Database Migrations

This directory contains SQL migration files that need to be applied to the Supabase database to ensure all features work correctly.

## Available Migrations

- `create_tags_tables.sql`: Creates the `tags` and `link_tags` tables needed for the tag management feature
- `link_expiration_and_redirect_rules.sql`: Adds expiration and redirect rule functionality to links

## How to Apply Migrations

To apply these migrations to your Supabase database:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy the contents of the migration file you want to apply
5. Paste the SQL into the query editor
6. Run the query

Alternatively, if you're using the Supabase CLI, you can run:

```bash
supabase db push
```

## Troubleshooting

If you see errors in the application related to missing tables (like `link_tags` or `tags`), it means you need to apply the `create_tags_tables.sql` migration to your database.

Common error messages that indicate you need to run migrations:

```
Error fetching link tags: {code: 'PGRST205', details: null, hint: "Perhaps you meant the table 'public.links'", message: "Could not find the table 'public.link_tags' in the schema cache"}
```

After applying the migrations, restart your application to ensure all features work correctly.