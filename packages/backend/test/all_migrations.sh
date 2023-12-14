#!/bin/ash
find /docker-entrypoint-initdb.d/migrations -name migration.sql -print0 | sort -z | xargs -0 cat | psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
