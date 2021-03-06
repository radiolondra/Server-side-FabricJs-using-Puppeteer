![RadioLondra](../master/logo/rlc.jpg)
# Using FabricJs server side with Puppeteer
### Howto render Fabric canvas objects to image server side without the Node-Canvas module

Creating an image server side using the Fabricjs node-module canvas is not reliable, as demonstrated in this repo:

https://github.com/radiolondra/Fabric-and-or-Node-Canvas-Issues

reported in the FabricJs Web Site:

https://github.com/kangax/fabric.js/wiki/Fabric-limitations-in-node.js

and discussed in this post:

https://github.com/kangax/fabric.js/issues/4812

Node-Canvas, used by the FabricJS node-module, is actually not able to scale/position fabric's objects properly. Lot of issues are reported especially for Text and patterns rendering and image loading.

### My Sample Scenario
Imagine we created a browser based video editor where the user can create some fabricjs objects with animations and he/she can overlay them over a previously chosen video object to create a new customized video. 
Each object visibility starts at specific frame of the base video and ends at another specific frame playing added animations. 
To create the overlays we need to scale all the objects to the real base video width and height, create one PNG for each frame and then use ffmpeg to put all together and create the final (overlayed) video.

It's unthinkable to create all the PNGs client side and send them to the server for ffmpeg processing, because the sending process needs a lot of time and resources. So we have to create the PNG files server side.

### Which is your?
Whatever the scenario and whatever the job you want to do, if you need to export the Fabricjs objects in some image files and perform some time-consuming processing on the images, and you need/want to do it server side, the usage of Nodejs versions of FabricJs with Node-Canvas is not the right way.

### What can we do?
The only reliable and fast way is to use, server side, the FabricJs library with the help of some headless browser and "simulate" exactly what you'd have done client side.

In this repo I used FabricJs 1.7.20 and Puppeteer ( https://github.com/GoogleChrome/puppeteer ) to create a simple NodeJs app able to create a PNG file starting from a Json encoded FabricJs canvas remotely sent by the client browser. The Fabric version used server side is the same version (better, the same file) used client side, so no Node-Canvas. And we are safe and happy.

#### Note: the http server used here is a Nginx server. All the http server settings below are valid for Nginx only.

### Used Behaviour:
- Ubuntu 16.04.3 as VMWare virtual machine (remember to install VMWare Tools too)
- Nginx 1.10.3
- NodeJs 8.10.0

### Step 1: INSTALL NGINX

```$ sudo apt-get update```

```$ sudo apt-get install nginx```

### Step 2: INSTALL CURL

```$ sudo apt-get install curl```

### Step 3: INSTALL NODEJS LTS (includes NPM)

```$ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -```

```$ sudo apt-get install nodejs```

### Step 4: INSTALL PM2 MANAGER GLOBALLY (useful to launch/control NodeJs apps)

```$ sudo npm install pm2 -g```

### Step 5: INSTALL CHROME DEPENDENCY
#### 1 -Download the package:

(for Ubuntu 64 bits systems. For Ubuntu 32 bits or other OSes go to the google download website and download the right file).

```$ wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb```

#### 2 - Install the package forcing install of dependencies:

```$ sudo dpkg -i --force-depends google-chrome-stable_current_amd64.deb```

#### 3 - In case any dependencies didn't install (you got some warning/error while installing) force them with:
```$ sudo apt-get install -f```

and launch the (**2**) again.

### Step 6: COPY THE REPO AND INSTALL THE NEEDED NODE MODULES

Now copy the repo folder (testpuppetgithub) into your linux ```/home/<youruser>``` folder and:

```$ cd testpuppetgithub```

Now install the needed node modules:

```$ npm install```

This will use the package.json file to install all the needed modules. Puppeteer is installed too together with the Chromium lib.

### Step 7: CONFIGURE NGINX

Now it's time to configure your Nginx server to answer the app requests.

To configure it, you need to know the IP address of your linux box. To do this you can use ```ifconfig```. Write down the IP address.
Also you need the port number where our app is listening for connections. The ftestpuppet.js app actually listens at the port 44533.

#### Remember that you could need to add NAT (e.g. you are using VMWare) and open the listening port (in this case 44533) or play with your firewall (if you have one running). If those basic network configuration are not correctly set the client browser will not be able to reach the linux box IP address.

#### Now lets configure Nginx.

```$ cd /etc/nginx/sites-available```

**_This is not the correct way_** (as you should create and configure new Nginx server blocks) but to make things simpler and faster, simply make a safety copy of the "default" file (the server block Nginx creates by default):

```$ sudo cp default default-ORIGINAL```

Now edit the "default" file, delete all rows and put the following:

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

All done. 

**Restart Nginx:**

```$ sudo systemctl restart nginx```

Verify Nginx is running:

```$ sudo systemctl status nginx```


### Step 7: RUN THE APP

**Now it's time to run our app:**

```
$ cd

$ cd testpuppetgithub

$ pm2 start ftestpuppet.js
```
**Now the app is running, waiting for connections.**

To inspect the app logs while the app is running:

```$ pm2 logs ftestpuppet --lines 10000```

In your Windows(?) box, open your browser and type the address of the linux box (in my case http://192.168.248.132)

If your basic network settings are correct, you will see a page (testJson.html) with an input text box, one button and 2 canvas: the canvas at the top is the original canvas (900x510), the canvas at the bottom is the final (resized) canvas (1920x1080). The input text box contains the resized fabric canvas objects Json encoded. Clicking the button the Json data will be sent to the server application which will create the final PNG file in the testpuppetgithub/pngs folder. 

### Et voilà! All done.

#### Note: I resized the canvas client side but, obviously, you can simply modify the code to resize it server side before to create the PNG.

In this application, where Puppeteer uses the template.html page, I used some custom Fabricjs objects classes with several custom properties added (see libs/fabfunctions.js). The same Fabricjs custom classes are used client side (testJson.html) while creating the canvas (see libs/maintest.js).

In the application, Puppeteer uses template.html to perform all the job. This page includes the needed scripts (jQuery, FabricJs and fabfunctions) and defines the server side used canvas in the DOM.

The client page (testJson.html) and the server page (template.html) both use the same fabric.js file (libs/fabricjs.js, version 1.7.20)

**It is a good idea now to esplore the code to understand what, where and how things happen** :)

To exit the logs type CTRL-C.

To stop all the running apps:

```$ pm2 stop all```

To clean the logs:

```$ pm2 flush```

### Have fun!
