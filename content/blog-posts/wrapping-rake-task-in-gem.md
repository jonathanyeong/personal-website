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

Let's pass arguments and download the tar file:

```
# frozen_string_literal: true
require 'open-uri'

TAR_EXT = '.tar.gz'.freeze
DEFAULT_ARCHIVE_URL = 'https://git.enova.com/brazil/schema_registry/archive/'.freeze
DEFAULT_OUTPUT_DIR = 'app/messages'.freeze
DEFAULT_DOWNLOAD_DIR = 'tmp/'

namespace :enova_protobufs do

  desc 'Generate the Protos'
  task :generate, [:release, :github_archive_url, :output_dir] do |task, args|
    args.with_defaults(:github_archive_url => DEFAULT_ARCHIVE_URL)
    args.with_defaults(:output_dir => DEFAULT_OUTPUT_DIR)

    abort("Error: No Release Specified\n\n" + help_text) if args[:release].nil?

    Dir.mkdir(DEFAULT_DOWNLOAD_DIR) unless Dir.exist?(DEFAULT_DOWNLOAD_DIR)
    filename = args[:release] + TAR_EXT

    open(DEFAULT_DOWNLOAD_DIR + filename, 'w') do |local_file|
      begin
        open(args[:github_archive_url] + filename) do |remote_file|
          puts "Downloading TAR: #{args[:github_archive_url] + filename}"
          local_file.write(Zlib::GzipReader.new(remote_file).read)
        end
      rescue OpenURI::HTTPError => e
        abort("Error: downloading tar with this URL: #{args[:github_archive_url] + filename} caused this error: #{e}")
      end
    end

    puts "Succesfully download the TAR file found here: #{DEFAULT_DOWNLOAD_DIR + filename}"
  end
end

def help_text
  <<~HEREDOC
    Usage: rake enova_protobufs:generate[release, github_archive_url, output_dir]
    github_archive_url (default) -> #{DEFAULT_ARCHIVE_URL}
    output_dir (default) -> #{DEFAULT_OUTPUT_DIR}
  HEREDOC
end
```



How do we load this in Rails?

What can we do next with this?

Link to Open Source project.