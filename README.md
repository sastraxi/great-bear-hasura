# Great Bear (Hasura)

### Prerequisites

* local docker

### Getting started

1. Run `yarn` to download project dependencies.
2. `cp .env.example .env` and fill in details.
3. Execute the SQL in `bootstrap/` as superuser, first in the `postgres` database and then in the `gbh` database (or whatever you choose to call it).
4. Make sure your connection string points to the database you just created, then run `pgsh up` to migrate to the latest version.
5. Run `pgsh psql < seed.sql` to seed the database with some dishes you can order.
6. `yarn start` to begin the server, which hosts the following:
    1. the auth webhook
    2. the auth remote schema
    3. the cart remote schema
    4. event webhooks
7. `docker-compose up` to start the Hasura appliance, which will communicate with our running. You can also view [docker-compose.yaml](docker-compose.yaml) to see what we're passing to the container.
8. Open the Hasura console by navigating to http://localhost:8080 (by default) and enter in the `HASURA_SECRET` from your `.env` file as the password.
9. Navigate to settings (the cog in the top-right of the screen), click Import Metadata, and select [the metadata JSON file](hasura/metadata.json) in this repository. Hasura annotates relationships separately in its own schema; `metadata.json` is a dump of these annotations.
10. Clone `https://github.com/sastraxi/great-bear-frontend` and follow its setup instructions. Put the following in its `.env`:
    ```
    REACT_APP_GRAPHQL_VARIANT=hasura
    REACT_APP_GRAPHQL_URL=http://localhost:8080/v1/graphql # by default
    REACT_APP_SUBSCRIPTION_URL=ws://localhost:8080/v1/graphql # by default
    ```
11. Run the frontend with `yarn start` as well.
12. Navigate to http://localhost:3000 (by default).

### Current medium-term plan

1. Add error handling
2. Add some testing
