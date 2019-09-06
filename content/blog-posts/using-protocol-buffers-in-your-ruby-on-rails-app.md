+++
author = ""
date = "2019-09-06T05:00:00+00:00"
draft = true
hero = ""
title = "How to package your Protobufs into a gem"
type = ""

+++
**_What is my use case for using them? Maybe talk about what they are._**

At work there's been a push towards a more event driven architecture. A key component of this is to define a domain model. Protocol Buffers (Protobufs) are a great way to do this. It's a brainchild of the devs at Google, from the [google protobuf docs](https://developers.google.com/protocol-buffers/ "Google Protobuf Docs") "think XML, but smaller, faster, and simpler".

I wanted to start using Protobufs in my Ruby on Rails project. Protobufs themselves are language neutral but there's a compiler that will compile them to your language of choice.  I started by including the Protobufs into my project code and then adding the auto generated Ruby files to the Rails load path. Everything seemed hunky-dory. I could access my Protobufs class and send them to the ether.

**_What issues am I having getting them into my Ruby on Rails app._**

Here's where things started getting tricky: we wanted to share this domain model with multiple applications. How do you do this if each project has their own definition of the Protobufs? 

**_What were the solutions I explored_**

I explored four different solutions for this:

1\. Package the protobuf into a gem:

	- Pros: A gem is a very familiar construct. People who import the gem don’t need to worry about where their \`.proto\` files live. And they can also get the latest compiled \`proto.rb\` files from the gem. Since these files are compiled automatically, you also don’t need to worry about storing them in your application code.

	- Cons: Whenever we update a proto we’ll need to remember to update the gem version to be able to use the new protos. It also adds another layer of abstraction.

2\. Send a RESTful call to a Go service which will then turn the JSON into a proto 

	- Pros: Go has much better package management with Protos. Unless we put it behind a \`go.mod\` file it should always pull down the latest proto files. It will also be a single place where we send protobuf messages to our kafka topics.

	- Cons: We are now breaking the beauty of Protobufs. That is to have a singular domain message model. If we call the Go service with JSON we now need to make sure that the JSON message structure is up to date. And JSON is nowhere nearly as strictly typed as a protobuf.

	- WAIT - but with that logic, LSE doesn’t make sense. We’re taking in JSON payloads to LSE that we convert into a protobuf. What’s the difference with that vs using a centralized go service.

3\. Rake task to pull in the tar.tgz file from github - you could specify the version you pull down from github.

	- Pro: No abstractions, more control on the version of the protos you pull down. You have flexibility in where you put your generated proto files. If you needed to you could also commit the proto files to github. You can write system commands in a rake task to download the protobuf schema registry and generate the protos. 

	- Con: Every app will need to have this rake task. Depending on the team, rake tasks could start becoming unique. Hard to guarantee consistency on how brands handle pulling in protobufs. Pretty low-level to write. You will need to do a lot of file manipulation when writing your rake task.

4\. Rake task with submodule in your folder

	- Pro: Submodules were made for a situation like this. It could be coupled with a rake task to pull the latest proto before auto-generating the files. 

	- Cons: Submodules can also be very confusing for people. It introduces a whole new set of commands that we don’t use on a day to day basis at Enova e.g. \`git submodule update\`. Same cons as the Rake task con above.

Solution that I ended up doing.

What did I need to do to build out that solution - challenges, design decisions faced.