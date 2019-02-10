### Design Decisions

* stay as close to Hasura's 3-factor methodology as possible

### Steps

1. `curl -L https://github.com/hasura/graphql-engine/raw/master/cli/get.sh | bash`
2. `hasura init`

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
