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
   the checkout mutation is now just inserting into `order`
9. Realize that cookies aren't going to work via websockets :(
10. The websockets bug is fixed!
11. Upgrade to latest version of hasura (`beta.6`) and find out that the existing db won't work
12. Move migrations from hasura to knex and build a db from scratch
13. Fix up metadata and re-export to `hasura/metadata.json`
14. Move cart schema over to a friendlier folder structure consistent with great-bear-postgraphile
15. Upgrade auth to be a remote schema as well now that cookies are being sent properly

### TODO
* trigger to extract "public" charge information from stripe_charge and put into stripe_charge_public
* remove current_cart stuff / default order.user_id to finish using hasura idiomatically

### Thoughts on Hasura / impl.
* docs are pretty good though they seem aimed at hiding complexity rather than exposing it
* why do I have to delete two yaml files every time I create a migration?
* singular table names (e.g. `user`) create awkward query names (e.g. `user { ... }` returns multiple users)
  * also `userByuserId` -- inconsistent camel case notation
  * easy enough to modify these into better names via the web console
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
* two ways to do `current*`:
  * currentCart is implemented using a view and tracked by hasura
  * currentUser is implemented via stitched in schema
* starting checkout by inserting into "order":
  * we have to insert cart_id and user_id. what are our options?
    * fe knows both values; grab them and forward them on
      * addtl roundtrip?
      * hasura has to validate; don't need order <-> cart relationship other than for this
    * default values
      * user_id not null default current_user_id()
      * can't do this though:
        * cart_id not null default (select id from cart where session_id = current_session_id())
    * let them be null and set them in `1-create-order.ts`.
  * ended up going with `user_id` via default and `cart_id` set via frontend
* why is `current_setting('hasura.user')` giving grief in beta6?
  * it's not all bad... the new way is more idiomatic.
  * seems like the console is pretty expressive after all

### Resources
* https://3factor.app
* https://github.com/hasura/3factor-example
* https://docs.hasura.io/1.0/graphql/manual/hasura-cli/install-hasura-cli.html
* https://medium.com/aherforth/how-to-get-auto-restart-and-breakpoint-support-with-typescript-and-node-5af589dd8687
* https://spotinst.com/blog/2017/11/19/best-practices-serverless-connection-pooling-database/

### Custom actions in Hasura
I can think of three ways to run some javascript code as a response to a GraphQL mutation:

1. Forward the mutation to a [remote schema](https://docs.hasura.io/1.0/graphql/manual/remote-schemas/index.html).
2. Similarly, you can proxy to Hasura yourself and stitch in as many other schemas as you'd like.
3. Trigger on an database event (e.g. `INSERT`) and use the Event Trigger architecture.
   You essentially create a "work log" for your mutation, where inputs and outputs are columns in your table.
   Wait for the return value by creating a subscription.
