grant all privileges on schema public to greatbear;
create extension "postgis";

/**
 * Hasura doesn't have any strong opinions on schemas,
 * so we're throw everything in public.
 */
