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

    lib/
      protobuf_generator/
        version.rb
      task/
        gen_protos.rake
      protobuf_generator.rb
    protobuf_generator.gemspec
    README.md

The version.rb file will look like:

    # lib/protobuf_generator/version.rb
    module ProtobufGenerator
      VERSION = '0.0.1'
    end

Your gemspec will look like:

    # protobuf_generator.gemspec
    require_relative 'lib/protobuf_generator/version'
    
    Gem::Specification.new do |s|
      s.name        = 'protobuf_generator'
      s.version     = ProtobufGenerator::VERSION
      s.date        = '2019-09-09'
      s.summary     = 'A protobuf generator for your protobufs'
      s.description = 'Exposes a rake task that easily imports protobufs into your Rails apps'
      s.authors     = ["<your name>"]
      s.email       = '<your email>'
      s.files       = ["lib/protobuf_generator.rb"]
    
      s.require_paths = ['lib']
    
      s.required_ruby_version = '~> 2.6'
    
      s.add_dependency 'rake'
    end

Let's start with a hello world rake task:

```
# lib/task/gen_protos.rake
# frozen_string_literal: true

namespace :protobufs do

  desc 'Generate the Protos'
  task :generate do
    puts 'Hello World'
  end
end
```

Let's make sure this works, an easy way to do this is to make an example project that contains a gemfile that points to the gem.

```
gem 'protobuf_generator', path: '<path to gem>'
```

In this example project we'll also add in a Rakefile that loads the gem's rake task:

```
require 'enova_protobuf_generator'

load 'enova_protobuf_generator/task/gen_protos.rake'
```

Now we can run:

```
$ bundle exec rake enova_protobufs:generate

# Hello World
```

How do we load this in Rails?

What can we do next with this?

Link to Open Source project.