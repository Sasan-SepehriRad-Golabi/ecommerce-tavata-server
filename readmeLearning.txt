package.json has scripts section that use to run commands by npm [ command]. if it does not have
"start", npm start automatically run node server.js.
"scripts":{
"prestart":"...",
"start":"node server" or "nodemon server"
"poststart":"..."

}
by npm start these are executed in order.
get nodeEnv(){
return process.env.Node_ENV; it can be development or production
}
ex:
if(process.env.Node_ENV===development){....}else{....}
 we can change it in scripts:
"scripts":{
"start": "SET Node_ENV=development& node server.js", no need for set in linux, we should change env in the same line of 
start not in prestart because prestart and start and poststart do not run by same process.
no space between development and &.
}

we can have different scripts for linux and windows or for other puposes. npm run them like "start" by 
adding pre and post to them. for default npm scripts we can use npm <script_name>
for ourdefined npm run <script_name>
ex: we can have a script to start instance of mongo:
"scripts":{
"start":"SET Node_ENV=development& node server.js",
"mongo":"mongod --dbpath=./pathToDatabase/db"
}
ex2:
{
  "scripts": {
    "test": "mocha",
    "start": "SET Node_ENV=development& node server.js",
    "mongo": "mongod --dbpath=./pathToDatabase/db",
    "launch": "npm test && npm run mongo && npm start",
  }
}

now: npm run mongo.
we can define a script that run start mongo and ... in our arbitrary order.
there is a package "concurrency" that run all things that we want simultanously.
{
  "scripts": {
    "start": "concurrently \"node grip.js bacon\" \"node bite.js bacon\""
  }
}