+++
author = ""
date = "2019-09-09T05:00:00+00:00"
draft = true
hero = ""
title = "Wrapping Rake Task in Gem"
type = ""

+++
I want to unpack and auto-generate protobufs with a shared rake task between multiple applications. This is going to be great when we're sharing the domain model between multiple Rails apps.

Setup gem like this:

```
lib/
  protobuf_generator/
    version.rb
  task/
    gen_protos.rake
  protobuf_generator.rb
protobuf_generator.gemspec
README.md
```