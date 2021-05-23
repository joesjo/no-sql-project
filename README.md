# Nutricipies
Nutricipities is an application where users keep track of recipes, ingredients and nutritional information. Using Nutricipities, users can calculate average costs of recipes and general ingredients, measure and compare nutritional data between recipes and ingredients according to user input such as BMI, food preferences and goal weight or goal nutrition and budget, and get a list of suggested recipes or daily/weekly meal plans that match the user data. Users will be able to save meal plans and their favorite recipes to their profile. Nutricipities can also keep track of local grocery stores and calculate where the user can buy ingredients for their meal plans for the cheapest price.
## Prerequisites
Install these on your system prior to installation:
* Docker
* Git
* Node.js
* Node Package Manager
* Windows Powershell

## Installation
Run the following commands in Windows Powershell
```
git clone https://github.com/joesjo/no-sql-project
cd no-sql-project
npm install
cd db
docker run --name nutricipies-db -p7474:7474 -p7687:7687 -d -v ${PWD}/db/data:/data -v ${PWD}/db/logs:/logs -v ${PWD}/db/import:/var/lib/neo4j/import -v ${PWD}/db/plugins:/plugins --env NEO4J_AUTH=neo4j/password neo4j:latest
cd ..
npm run server
```
The database and API-server is now running and you can choose to either load the node data from the .csv-files in the import folder and create the relationships manually, or load the database restore from the .dump file in the backup folder. The database and API-server can be accessed in your web browser from the addresses localhost:7474 and localhost:3000 respectively. Accessing the database requires logging in with a username and password. The default username is “neo4j” and the default password is “password” specified in the commands above.