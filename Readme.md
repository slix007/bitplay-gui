# GUI for bitplay project

Init: `npm install`

build: `npm run build` - use host from window.location and production env

run:

`npm start` - NODE_ENV=development, host from window.location

`HOST=658 npm start` - host 658, see config.yml

deploy: `gradle deployHost658 -i` - see `build.gradle` file. 
Also `~\.gradle\gradle.properties` should be filled 

