### Design Decisions

* stay as close to Hasura's 3-factor methodology as possible

### Steps

1. `curl -L https://github.com/hasura/graphql-engine/raw/master/cli/get.sh | bash`
2. `hasura init`


### TODO

* trigger to extract "public" charge information from stripe_charge and put into stripe_charge_public

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
3. Trigger on an database event (e.g. `INSERT`) and use the Event Trigger architecture. You essentially create a "work log" for your mutation.
