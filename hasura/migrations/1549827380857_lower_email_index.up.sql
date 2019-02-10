create index user___lower_email___idx
  on "user"
  using btree (lower(email));
