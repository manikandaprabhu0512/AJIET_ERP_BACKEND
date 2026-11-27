# AJIET ERP Backend

## Database migrations

Migration scripts are kept in `migrations/`. Run a specific migration from the
backend root, for example:

```sh
node migrations/migrate_subject_allocations.js
```

The schema bootstrap script is `node migrations/migrate.js`.

## Testing backend
