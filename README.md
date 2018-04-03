# Using not-node-module FabricJs server side with Puppeteer

Creating a PNG image server side starting from a Fabricjs node-module canvas is not reliable, as demonstrated in this repo:

https://github.com/radiolondra/Fabric-and-or-Node-Canvas-Issues

and discussed in this post:
https://github.com/kangax/fabric.js/issues/4812

Node-Canvas, used by the FabricJS node-module, is actually not able to correctly work with objects' scaling/positioning, specially for Text and patterns.

Imagine you created a browser based video editor where the user can create some fabricjs objects with animations and overlay them over a previously chosen video object. Each object starts at specific frame of the base video and ends at another specific frame. To create the overlays you need to scale all the objects to the real base video width and height, create one PNG for each frame and then use ffmpeg to put all together and create the final (overlayed) video.

It's unthinkable to create the PNGs client side and send them to the server for ffmpeg processing, because the sending process needs a lot of time and resources. So we have to create the PNG files server side.

Anyway, whatever the job you want to do, if it needs to export the Fabricjs objects in some image files and perform some time-consuming processing on the image, and you want to do it server side, the usage of Nodejs versions of FabricJs and Node-Canvas is not the right way.

### What can we do?

The only reliable and fast way is to use, server side, the normal FabricJs library (not the nodejs one) with the help of some headless browser and "simulate" exactly what you'd have done client side.

In this repo I used FabricJs 1.7.20 and Puppeteer ( https://github.com/GoogleChrome/puppeteer ) to create a simple NodeJs app able to create a PNG file starting from a Json encoded FabricJs canvas remotely sent by the client browser. The Fabric version used server side is the same version (better, the same file) used client side, so no Node-Canvas, and we are safe and happy.

#### Note: the http server host is a Nginx server. All the http server settings reported here are for Nginx only.

### Used Behaviour:

Ubuntu 16.04.3 as VMWare virtual machine (remember to install VMWare Tools too)

Nginx 1.10.3

NodeJs 8.10.0

### INSTALL NGINX

```$ sudo apt-get update```

```$ sudo apt-get install nginx```

### INSTALL CURL

```$ sudo apt-get install curl```

### INSTALL NODEJS LTS (includes NPM)

```$ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -```

```$ sudo apt-get install nodejs```

### INSTALL PM2 MANAGER GLOBALLY (useful to launch/control NodeJs apps)

```$ sudo npm install pm2 -g```

Now copy the repo folder (testpuppetgithub) into your linux ```/home/<youruser>``` folder and :

```$ cd testpuppetgithub```

### INSTALL THE NEEDED NODE MODULES

```$ npm install```

This will use the package.json file to install all the needed modules. Puppeteer is installed too together with the Chromium lib.


Now it's time to configure your Nginx server to answer the app requests.

To configure it, you need to know the IP address of your linux box. To do this you can use ```ipconfig```. Write down the IP address.
Also you need the port number where our app is listening for connections. The ftestpuppet.js app actually listens at the port 44533.

#### Remember that you could need to add NAT (e.g. you are using VMWare) and open the listening port (in this case 44533). If those basic network configuration are not correctly set the client browser will not be able to reach the linux box IP address.

### Now lets configure Nginx.

```$ cd /etc/nginx/sites-available```

This is not the right way but to make thing simpler and faster, make a copy of the "default" file:

```$ sudo cp default default-ORIGINAL```

Now edit the default file, delete all rows and put the following:

```
upstream http_backend {
  server 127.0.0.1:44533; # this is the port where our app is listening
}

server {
	listen 80;
	server_name 192.168.248.132; # PUT HERE THE IP ADDRESS OF YOUR LINUX BOX (ifconfig)
	root /var/www/html;
	index index.html;

	location / {
		proxy_pass http://http_backend;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_http_version 1.1;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection 'upgrade';
		proxy_set_header Host $host;
		proxy_cache_bypass $http_upgrade;
	}
}
```

All done. Now it's time to run our app:

```
$ cd

$ cd testpuppetgithub

$ pm2 start ftestpuppet.js
```

To inspect the app logs while running:

```$ pm2 logs ftestpuppet --lines 10000```

Now the app is running, waiting for connections.

In your Windows box, open your browser and type the address of the linux box (in my case http://192.168.248.132)

You will see a page (testJson.html) with an input text box, one button and 2 canvas: the canvas at top is the original canvas (900x510), the canvas at bottom is the final (resized) canvas (1920x1080). The input text box contains the resized fabric canvas objects Json encoded. Clicking the button the Json data will be sent to the server application which will create the final PNG file in the testpuppetgithub/pngs folder.

#### Note: I resized the canvas client side but, obviously, you can simply modify the code to resize it server side before to create the PNG.

In this application I used some custom Fabricjs objects classes with several custom properties added. The same classes are used client side (testJson.html) while creating the canvas (libs/maintest.js).

In the application, Puppeteer uses template.html to perform all the job. This page includes the needed scripts and defines the server side used canvas in the DOM.

The client page (testJson.html) and the server page (template.html) both use the same fabric.js file (version 1.7.20)

It is a good idea now to esplore the code to understand what, where and how things happen :)

To exit the logs type CTRL-C.

To stop all the running apps:

```$ pm2 stop all```

To clean the logs:

```$ pm2 flush```

Have fun!
