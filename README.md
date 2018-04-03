# Server side FabricJs using Puppeteer

Creating a PNG from fabricjs canvas server side is not reliable, as demonstrated in this repo:

https://github.com/radiolondra/Fabric-and-or-Node-Canvas-Issues

and discussed in this post:
https://github.com/kangax/fabric.js/issues/4812

Node-Canvas, used by Node FabricJS, is not able to correctly work with objects' scaling/positioning, specially for Text and patterns.

Imagine you created a video editor where the user can create and overlay some fabricjs objects with animations. Each object starts at specific frame of the video and ends at another specific frame. To create the overlays you need to scale all the objects to the real video width and height, create one PNG for each frame and then use ffmpeg to put all together and create the final (overlayed) video.

It's unthinkable to create the PNGs client side and send them to the server for ffmpeg processing, because it needs a lot of time and resources. So we have to create the PNG files server side.

Anyway, whatever the job you want to do, if it needs to export the fabricjs objects in some image files and perform some time-consuming processing on the image, and you want to do it server side, the usage of Nodejs versions of FabricJs and Node-Canvas is not the right way.

What can we do?

The only reliable and fast way is to use some headless browser server side and "simulate" exactly what you'd have done client side.

In this repo I used Puppeteer ( https://github.com/GoogleChrome/puppeteer ) to create a simple NodeJs app able to create a PNG file starting from a Json encoded FabricJs canvas remotely sent by the client browser. The Fabric version used is the same version used client side, so no Node-Canvas, nothing.


