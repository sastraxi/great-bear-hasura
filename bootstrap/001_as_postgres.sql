create database gbh;

/* our app / hasura will connect as this user */
create user greatbear with password 'greatbear';
grant all privileges on database gbh to greatbear;
