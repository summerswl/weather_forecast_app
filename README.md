# README

These are the current requirements to run this app in a local workspace. The app repo is located at https://github.com/summerswl/weather_forecast_app under the name weather_forecast_app. It has public viewing enabled and you should be able to fork off a new repo and run this in your local environment.

Setup required for app to load and run on local environment:

* Ruby version - 3.2.8

* Rails version - 7.2.2.1

* Node version - 16.20.2 - any version lower than 16 and the node_modules will not load correctly

* NPM version - 8.19.4

* Configuration:
    I am using the 'concurrently' node to run the React frontend seperately from the RoR backend. When the 'npm run app' command is executed the Rails section of the app will start on port 3001 and then the React web layer of the app will start on port 3000

* Database creation - sudo apt update && sudo apt install -y postgresql-client

* Database initialization

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions ...
    * Start application with Docker:
        build app by running 'docker compose up --build' command
        App should be running at http://localhost:3000

* How to run the test suite ...
    * Testing is integrated with docker. When npm testing commands are executed
        the testing section within docker-compose will begin running the    
        tests
    * Run the 'npm run test' command to run all tests(rspec and jest)
    * Rspec tests: run 'npm run test-rspec' command for full rpsec test suite
        A single file can be run by adding the file structure to the command
        ex. - 'npm run test-rspec spec/controllers/weather_controller_spec.rb'
    * Jest tests: run 'npm run test-jest' command to run the full test suite
        A single test can be run by executing the 'npm test' command combined
        with the file name. 
        ex. - 'npm run test-jest Home.test.js'

