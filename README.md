### Design Decisions

* stay as close to Hasura's 3-factor methodology as possible

### Work log

1. `curl -L https://github.com/hasura/graphql-engine/raw/master/cli/get.sh | bash`
2. `hasura init`
3. `hasura migrate create ...`
4. Open http://localhost:8080/console and track everything
5. Add auth package and set `HASURA_GRAPHQL_AUTH_HOOK`
6. Define event responders and wire up to server
7. Add webhook env vars through docker-compose; create event triggers
8. Realize that you can't do mutations via `volatile` functions, so
   the "create order" mutation is now just inserting into `order`

### TODO

* trigger to extract "public" charge information from stripe_charge and put into stripe_charge_public

### Thoughts on Hasura / impl.

* docs are pretty good though they seem aimed at hiding complexity rather than exposing it
* why do I have to delete two yaml files every time I create a migration?
* singular table names (e.g. `user`) create awkward query names (e.g. `user { ... }` returns multiple users)
  * also `userByuserId` -- inconsistent camel case notation
* would be nice to have metadata in the repo rather than in the db
  * seems like migrations are created sometimes... only started recently, no config changes (???)
* ws endpoint is same as http endpoint
  * apollo docs are great for examples and bad for API documentation; can't set credentials: 'include' on ws at all
* this is a poweful paradigm:
```sql
create function get_hasura_user()
returns jsonb as $$
  select nullif(current_setting('hasura.user', true), '')::jsonb
$$ language sql stable;

create function current_user_id()
returns integer as $$
  select case when get_hasura_user() is null
    then null 
    else (get_hasura_user()->>'x-hasura-user-id')::integer
  end
$$ language sql stable;
```

### Resources

* https://3factor.app
* https://github.com/hasura/3factor-example
* https://docs.hasura.io/1.0/graphql/manual/hasura-cli/install-hasura-cli.html
* https://medium.com/aherforth/how-to-get-auto-restart-and-breakpoint-support-with-typescript-and-node-5af589dd8687
* https://spotinst.com/blog/2017/11/19/best-practices-serverless-connection-pooling-database/


### Resources for PostGraphile Implementation

* https://blog.2ndquadrant.com/what-is-select-skip-locked-for-in-postgresql-9-5/
* https://github.com/graphile/postgraphile/issues/92
* https://github.com/andywer/pg-listen for custom subscriptions


### Custom actions in Hasura

I can think of three ways to run some javascript code as a response to a GraphQL mutation:

1. Forward the mutation to a [remote schema](https://docs.hasura.io/1.0/graphql/manual/remote-schemas/index.html).
2. Similarly, you can proxy to Hasura yourself and stitch in as many other schemas as you'd like.
3. Trigger on an database event (e.g. `INSERT`) and use the Event Trigger architecture.
   You essentially create a "work log" for your mutation, where inputs and outputs are columns in your table.
   Wait for the return value by creating a subscription.
