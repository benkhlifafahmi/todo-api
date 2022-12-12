# Simple Todo API.
## Install environement.
to run this API you need to have, MySQL server install, NodeJS, NPM (tested on node v16 and npm v8 ).

## Install the app requirements.
```shell
user@linux$ npm install
```

## Setting up environement.
create a **.env** file (copy of the .evn.example file) and update it with the correct parameters.
verify you **MySQL** server connection string.  
Run prisma using npx:
```shell
user@linux$ npx prisma generate
```
```shell
user@linux$ npx prisma db push
```
Now you need to create a copy of the database (**todo-app**) and name it as (**todo-app-test**). Note that todo-app and todo-app-test are the names of dev database and tests database.

## Run Tests.
to run the test and make sure the api is function as expected.
```shell
user@linux$ npm run test
```

## Run the API Server
```shell
user@linux$ npm run dev
```

## Read OpenAPI spec:
you can visit swagger http://localhost:8080/docs using the username **admin** and password **swagger**