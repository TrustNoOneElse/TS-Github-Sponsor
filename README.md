# A project which provides you a backend which fetches all information for the github sponsoring for you

## Step by Step guide for setting up your side

1. You need to get a application key here: https://github.com/settings/applications/new
   - Best is to follow this guide, if you are unsure what you need to there https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app
2. You need a way to provide a actual login for the user, you have actual three options which are all listed here: https://docs.github.com/en/developers/apps/building-github-apps/identifying-and-authorizing-users-for-github-apps

## Step by Step guide for setting up this backend
1. Get a personal key https://github.com/settings/tokens/new, with the rights "user:read" and "org:read" at least
2. Clone the project
3. Get the latest node.js https://nodejs.org/en/download/
4. Go into this project and hit "npm install" to install all dependencies
5. After that execute "npm run build" to compile the ts code to js code
6. Then you are ready to go and can start the Backend with ``` PORT=3000 ORIGIN='*' TOKEN=gpg node dist/main```. These are Environment variables which are only provided to the node.js instance and cannot access elsewhere
   1. PORT is the port where the backend should start
   2. ORIGIN is for cross origin, if you don't mind who access it, you can leave it with a *, otherwise here you find the options for origin https://github.com/expressjs/cors#configuration-options
   3. TOKEN this is your personal token which you generate in step 1

## Communication

### Get Sponsor by authorize token
``` httpClient.get(backend_url:backend_port/viewer/sponsor/token?token=USER_TOKEN) ```

### Get Sponsor by loginName
``` httpClient.get(backend_url:backend_port/viewer/sponsor/login?login=USER_LOGIN_NAME) ```
 
### Check if loginName is Sponsor of you
``` httpClient.get(backend_url:backend_port/viewer/sponsor/by?login=USER_LOGIN_NAME)```

## Check if you are Sponsor of the user
``` httpClient.get(backend_url:backend_port/viewer/sponsor/to?login=USER_LOGIN_NAME)```

### Get all your Sponsors
``` httpClient.get(backend_url:backend_port/viewer/sponsor/all)```