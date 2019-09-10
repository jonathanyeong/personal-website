+++
author = ""
date = "2019-09-10T05:00:00+00:00"
draft = true
hero = ""
title = "My current blog stack"
type = ""

+++
Forestry as the static site CMS. It's free. Easy to hook up. Forestry works by connecting to your site on Github. It will make commits to your repo. So whenever you make a post that post will be saved to github. 

What's the real power behind forestry? Hooks into front matter.

It's also has some starter templates that you can use to setup a site.

To serve my site I use netlify. It's also free! I changed my nameservers on my domain host to point to Netlify's name servers. Then it also connects to the github repo to track any commits that go to master. When something is pushed to master it will run a deploy script and update the site. You don't need cloudlfare with netlify. 

Having this setup is great for a few reasons

* The only cost is paying for the domain name.
* Static sites are fast.
* Set it and forget it.

What are some of the things I could improve on.

* I wish forestry had auto save. 
* You're at the whims of Netlify. That's totally fine with me, but if you wanted more control over how your site is built and hosted you could probably roll your own