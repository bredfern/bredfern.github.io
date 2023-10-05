+++
title = "Why Not Web Fonts?"
date = 2023-10-05
+++

So there are many web apis that are really meant for web application development rather than web site development.

One of those is the web font api, which is great for application design whether its a PWA or other platforms that use web UI for their front end like Tauri.

So when you deliver an app with Tauri the fonts are baked in, there is no cost for those fonts. They come embedded or with a PWA they get cached offline so there is no performance penalty.

When it comes to blogs and web page publishing there is a penalty in complexity and also requires more bandwidth to send your message to the world, With classic html fonts that are build into the browser. While they may be insufficient for web application front end UI needs they are the best option for blogs and other one to many messaging platforms.
