# Electric Vehicle Charging Station (EVSE) - Dashboard

## Summary

The Angular dashboard connects to the [EVSE Server](https://github.com/LucasBrazi06/ev-server) to display the charging stations in real time.

The application:

* Displays of the charging stations, their status and their delivered power in real time.
* User management (create, update, delete, authorize, change role...)
* Charging station charging curve real time
* Actions on charging stations: Reboot, Clear Cache, Stop Transaction, Unlock Connector...
* Energy control: Set the maximum energy delivered by the charging station

**Live demo here** [e-Mobility](https://qa.e-mobility-group.com/)

## Installation

* Install NodeJS: https://nodejs.org/ (install the LTS version)
* Install Python version 2.7 (not the version 3.7!)
* Clone this GitHub project
* Go into the **ev-dashboard** directory and run **npm install** or **yarn install** (use sudo in Linux)

**NOTE**: On Windows with **chocolatey** (https://chocolatey.org/),
do as an administrator:
```
choco install -y nodejs-lts python2
```
to install all needed dependencies

* Follow the rest of the setup below

## The Dashboard

#### Configuration

There is one template provided: **src/assets/config-template.json**.

Rename it to **config.json**.

Move this configuration file into the **src/assets** directory.

Edit this file, you will set relevant config data in it.

#### Connect to the Central Service REST Server (CSRS)

The dashboard is served by a web server, downloaded into the browser and will call the REST Server to retrieve and display the data.

Set the REST Server URL:

```
  "CentralSystemServer": {
    "protocol": "http",
    "host": "localhost",
    "port": 80
  },
```

## Start the Dashboard Server

### Development Mode

```
npm start
```

### Production Mode
First build the sources with:
```
npm run build:prod
```

Next, start the server with:
```
npm run start:prod:dist
```

### Secured Production Mode (SSL)
Build the sources as above and run it with:
```
npm run start:prod:dist:ssl
```

## Tests End To End
To run e2e tests, you first need to have a server and UI up and running. Then start the e2e suite with:
```
npm run e2e
```

That's it!

## License

This file and all other files in this repository are licensed under the Apache Software License, v.2 and copyrighted under the copyright in [NOTICE file](NOTICE), except as noted otherwise in the [LICENSE file](LICENSE).

Please note that Docker images can contain other software which may be licensed under different licenses. This LICENSE and NOTICE files are also included in the Docker image. For any usage of built Docker images please make sure to check the licenses of the artifacts contained in the images.
