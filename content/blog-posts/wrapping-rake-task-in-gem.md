+++
author = ""
date = "2019-09-09T05:00:00+00:00"
draft = true
hero = ""
title = "Wrapping Rake Task in Gem"
type = ""

+++
[Protocol Buffers](https://developers.google.com/protocol-buffers/) (Protobufs) are a great way to express a message. Written by Google, Protobufs give you the readability of JSON but the structure of something like XML. Using the `protoc` tool you can compile the protobufs into a language of your choosing.

A use case for Protobufs is sharing a domain model between multiple services in your ecosystem. However, this is a challenge with Ruby on Rails. Unlike Go, Ruby does not have a great way to import a shared protobuf library.

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

    # lib/task/gen_protos.rake
    # frozen_string_literal: true
    
    namespace :protobufs do
    
      desc 'Generate the Protos'
      task :generate do
        puts 'Hello World'
      end
    end

Let's make sure this works, an easy way to do this is to make an example project that contains a gemfile that points to the gem.

    gem 'protobuf_generator', path: '<path to gem>'

In this example project we'll also add in a Rakefile that loads the gem's rake task:

    require 'enova_protobuf_generator'
    
    load 'enova_protobuf_generator/task/gen_protos.rake'

Now we can run:

    $ bundle exec rake enova_protobufs:generate
    
    # Hello World

Let's pass arguments and download the tar file (we can refactor this a little later):

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

A couple of things here:

* We want to default the github url and the output dir. This should be the same for most applications if we're sharing a protobuf repo.
* We require that the user specify the version to download. Otherwise the download won't work, and also ensures that we've tagged the protobuf repo correctly.
* We want to do a couple of checks. First we create the `tmp` directory if it doesn't exist. Then we also gracefully handle the error if the URL doesn't exist.
* Help text to help us show the usage of the rake task.

Unfortunately this will always save a file even if you fail to read from the URL. To fix this, we need to introduce the cleanup outside of the `open` block:

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
        download_tar(DEFAULT_DOWNLOAD_DIR + args[:release] + TAR_EXT, args[:github_archive_url] + args[:release] + TAR_EXT)
    
    
      end
    end
    
    def help_text
      <<~HEREDOC
        Usage: rake enova_protobufs:generate[release, github_archive_url, output_dir]
        github_archive_url (default) -> #{DEFAULT_ARCHIVE_URL}
        output_dir (default) -> #{DEFAULT_OUTPUT_DIR}
      HEREDOC
    end
    
    def download_tar(dest_folder, download_url)
      begin
        open(dest_folder, 'w') do |local_file|
          open(download_url) do |remote_file|
            puts "Downloading TAR: #{download_url}"
            local_file.write(Zlib::GzipReader.new(remote_file).read)
          end
        end
      rescue OpenURI::HTTPError => e
        File.delete(dest_folder)
        abort "Error: downloading tar with this URL: #{download_url} caused this error: #{e}"
      end
      puts "Succesfully download the TAR file found here: #{dest_folder}"
    end

This means we won't have random tars that we can't open living in the tmp folder.

Now we want to extract the tars and place the extracted files in the tmp folder. There's a bug in the gzip code above. This should be the download_tar method:

    def download_tar(dest_folder, download_url)
      begin
        Zlib::GzipWriter.open(dest_folder) do |local_file|
          open(download_url) do |remote_file|
            puts "Downloading TAR: #{download_url}"
            local_file.write(Zlib::GzipReader.new(remote_file).read)
          end
        end
      rescue OpenURI::HTTPError => e
        File.delete(dest_folder)
        abort "Error: downloading tar with this URL: #{download_url} caused this error: #{e}"
      end
      puts "Succesfully download the TAR file found here: #{dest_folder}"
    end

This code will unzip the file:

    # frozen_string_literal: true
    require 'open-uri'
    require 'rubygems/package'
    require 'zlib'
    
    TAR_LONGLINK = '././@LongLink'  # http://dracoater.blogspot.com/2013/10/extracting-files-from-targz-with-ruby.html
    TAR_EXT = '.tar.gz'.freeze
    DEFAULT_ARCHIVE_URL = 'https://git.enova.com/brazil/schema_registry/archive/'.freeze
    DEFAULT_OUTPUT_DIR = 'app/messages/'.freeze
    DEFAULT_DOWNLOAD_DIR = 'tmp/'
    
    namespace :enova_protobufs do
    
      desc 'Generate the Protos'
      task :generate, [:release, :github_archive_url, :output_dir] do |task, args|
        args.with_defaults(:github_archive_url => DEFAULT_ARCHIVE_URL)
        args.with_defaults(:output_dir => DEFAULT_OUTPUT_DIR)
    
        abort("Error: No Release Specified\n\n" + help_text) if args[:release].nil?
        Dir.mkdir(DEFAULT_DOWNLOAD_DIR) unless Dir.exist?(DEFAULT_DOWNLOAD_DIR)
        download_tar(DEFAULT_DOWNLOAD_DIR + args[:release] + TAR_EXT, args[:github_archive_url] + args[:release] + TAR_EXT)
        unzip_tar(DEFAULT_DOWNLOAD_DIR + args[:release] + TAR_EXT)
      end
    end
    
    def help_text
      <<~HEREDOC
        Usage: rake enova_protobufs:generate[release, github_archive_url, output_dir]
        github_archive_url (default) -> #{DEFAULT_ARCHIVE_URL}
        output_dir (default) -> #{DEFAULT_OUTPUT_DIR}
      HEREDOC
    end
    
    def download_tar(dest_folder, download_url)
      begin
        Zlib::GzipWriter.open(dest_folder) do |local_file|
          open(download_url) do |remote_file|
            puts "Downloading TAR: #{download_url}"
            local_file.write(Zlib::GzipReader.new(remote_file).read)
          end
        end
      rescue OpenURI::HTTPError => e
        File.delete(dest_folder)
        abort "Error: downloading tar with this URL: #{download_url} caused this error: #{e}"
      end
      puts "Succesfully download the TAR file found here: #{dest_folder}"
    end
    
    def unzip_tar(tar_path)
      puts "Unzipping tar at #{tar_path}"
      Gem::Package::TarReader.new( Zlib::GzipReader.open(DEFAULT_DOWNLOAD_DIR + args[:release] + TAR_EXT)) do |tar|
        dest = nil
        tar.each do |entry|
          if entry.full_name == TAR_LONGLINK
            dest = File.join(DEFAULT_DOWNLOAD_DIR, entry.read.strip)
            next
          end
          dest ||= File.join DEFAULT_DOWNLOAD_DIR, entry.full_name
          if entry.directory?
            FileUtils.rm_rf dest unless File.directory? dest
            FileUtils.mkdir_p dest, :mode => entry.header.mode, :verbose => false
          elsif entry.file?
            FileUtils.rm_rf dest unless File.file? dest
            File.open dest, "wb" do |f|
              f.print entry.read
            end
            FileUtils.chmod entry.header.mode, dest, :verbose => false
          elsif entry.header.typeflag == '2' #Symlink!
            File.symlink entry.header.linkname, dest
          end
          dest = nil
        end
      end
    end

Now that we've unzipped the tar we can start generating the protobuf files. We're just going to use the system `protoc` call.

However, we're missing one piece of data. How do we know the folder name that we just unzipped? I solved it by doing this

    # frozen_string_literal: true
    require 'open-uri'
    require 'rubygems/package'
    require 'zlib'
    
    TAR_LONGLINK = '././@LongLink'  # http://dracoater.blogspot.com/2013/10/extracting-files-from-targz-with-ruby.html
    TAR_EXT = '.tar.gz'.freeze
    DEFAULT_ARCHIVE_URL = 'https://git.enova.com/brazil/schema_registry/archive/'.freeze
    DEFAULT_OUTPUT_DIR = 'app/messages/'.freeze
    DEFAULT_DOWNLOAD_DIR = 'tmp/'
    
    namespace :enova_protobufs do
    
      desc 'Generate the Protos'
      task :generate, [:release, :github_archive_url, :output_dir] do |task, args|
        args.with_defaults(:github_archive_url => DEFAULT_ARCHIVE_URL)
        args.with_defaults(:output_dir => DEFAULT_OUTPUT_DIR)
    
        abort("Error: No Release Specified\n\n" + help_text) if args[:release].nil?
        Dir.mkdir(DEFAULT_DOWNLOAD_DIR) unless Dir.exist?(DEFAULT_DOWNLOAD_DIR)
        download_tar(DEFAULT_DOWNLOAD_DIR + args[:release] + TAR_EXT, args[:github_archive_url] + args[:release] + TAR_EXT)
        unzipped_folder = unzip_tar(DEFAULT_DOWNLOAD_DIR + args[:release] + TAR_EXT)
    
        puts 'Generating Protos'
        FileUtils.mkdir_p(args[:output_dir])
        system("protoc tmp/#{unzipped_folder}/*/*.proto --ruby_out=#{args[:output_dir]} -I tmp/#{unzipped_folder}")
      end
    end
    
    def help_text
      <<~HEREDOC
        Usage: rake enova_protobufs:generate[release, github_archive_url, output_dir]
        github_archive_url (default) -> #{DEFAULT_ARCHIVE_URL}
        output_dir (default) -> #{DEFAULT_OUTPUT_DIR}
      HEREDOC
    end
    
    def download_tar(dest_folder, download_url)
      begin
        Zlib::GzipWriter.open(dest_folder) do |local_file|
          open(download_url) do |remote_file|
            puts "Downloading TAR: #{download_url}"
            local_file.write(Zlib::GzipReader.new(remote_file).read)
          end
        end
      rescue OpenURI::HTTPError => e
        File.delete(dest_folder)
        abort "Error: downloading tar with this URL: #{download_url} caused this error: #{e}"
      end
      puts "Succesfully download the TAR file found here: #{dest_folder}"
    end
    
    def unzip_tar(tar_path)
      puts "Unzipping tar at #{tar_path}"
      unzipped_folders = []
    
      Gem::Package::TarReader.new( Zlib::GzipReader.open(tar_path)) do |tar|
        dest = nil
        tar.each do |entry|
          if entry.full_name == TAR_LONGLINK
            dest = File.join(DEFAULT_DOWNLOAD_DIR, entry.read.strip)
            next
          end
          dest ||= File.join DEFAULT_DOWNLOAD_DIR, entry.full_name
          if entry.directory?
            unzipped_folders << dest.gsub('tmp/', '')
            FileUtils.rm_rf dest unless File.directory? dest
            FileUtils.mkdir_p dest, :mode => entry.header.mode, :verbose => false
          elsif entry.file?
            FileUtils.rm_rf dest unless File.file? dest
            File.open dest, "wb" do |f|
              f.print entry.read
            end
            FileUtils.chmod entry.header.mode, dest, :verbose => false
          elsif entry.header.typeflag == '2' #Symlink!
            File.symlink entry.header.linkname, dest
          end
          dest = nil
        end
      end
      puts "Finished unzipping tar at #{tar_path}"
      return unzipped_folders.first.chomp('/')
    end

This will succesfully generate the protos in the app/messages folder.

How do we load this in Rails?

We'll need to use Railtie - what is it?

    # lib/enova_protobuf_generator/railtie.rb
    module EnovaProtobufGenerator
      class Railtie < Rails::Railtie
        railtie_name :enova_protobuf_generator
    
        rake_tasks do
          path = File.expand_path(__dir__)
          Dir.glob("#{path}/task/**/*.rake").each { |f| load f }
        end
      end
    end

Then I added this to my requires

    # lib/enova_protobuf_generator.rb
    require 'enova_protobuf_generator/railtie' if defined?(Rails)

I refactored this to use the Rake tasks:

    # frozen_string_literal: true
    require 'open-uri'
    require 'rubygems/package'
    require 'zlib'
    
    TAR_LONGLINK = '././@LongLink'  # http://dracoater.blogspot.com/2013/10/extracting-files-from-targz-with-ruby.html
    TAR_EXT = '.tar.gz'.freeze
    DEFAULT_ARCHIVE_URL = 'https://git.enova.com/brazil/schema_registry/archive/'.freeze
    DEFAULT_OUTPUT_DIR = 'app/messages/'.freeze
    DEFAULT_DOWNLOAD_DIR = 'tmp/'
    
    namespace :enova_protobufs do
      @unzipped_folder = ''
    
      desc 'Generate the Protos'
      task :generate, [:release, :github_archive_url, :output_dir] do |task, args|
        abort("Error: No Release Specified\n\n" + help_text) if args[:release].nil?
        args.with_defaults(:github_archive_url => DEFAULT_ARCHIVE_URL)
        args.with_defaults(:output_dir => DEFAULT_OUTPUT_DIR)
    
        destination_path = DEFAULT_DOWNLOAD_DIR + args[:release] + TAR_EXT
        download_url = args[:github_archive_url] + args[:release] + TAR_EXT
    
        Dir.mkdir(DEFAULT_DOWNLOAD_DIR) unless Dir.exist?(DEFAULT_DOWNLOAD_DIR)
        Rake::Task['enova_protobufs:download_tar'].invoke(destination_path, download_url)
        Rake::Task['enova_protobufs:unzip'].invoke(destination_path, download_url)
        Rake::Task['enova_protobufs:compile_protos'].invoke(args[:output_dir])
      end
    
      task :download_tar, [:dest_folder, :download_url] do |t, args|
        begin
          Zlib::GzipWriter.open(args[:dest_folder]) do |local_file|
            open(args[:download_url]) do |remote_file|
              puts "Downloading TAR: #{args[:download_url]}"
              local_file.write(Zlib::GzipReader.new(remote_file).read)
            end
          end
        rescue OpenURI::HTTPError => e
          File.delete(args[:dest_folder])
          abort "Error: downloading tar with this URL: #{args[:download_url]} caused this error: #{e}"
        end
        puts "Succesfully download the TAR file found here: #{args[:dest_folder]}"
      end
    
      task :unzip, [:tar_path] do |t, args|
        puts "Unzipping tar at #{args[:tar_path]}"
        unzipped_folders = []
    
        Gem::Package::TarReader.new( Zlib::GzipReader.open(args[:tar_path])) do |tar|
          dest = nil
          tar.each do |entry|
            if entry.full_name == TAR_LONGLINK
              dest = File.join(DEFAULT_DOWNLOAD_DIR, entry.read.strip)
              next
            end
            dest ||= File.join DEFAULT_DOWNLOAD_DIR, entry.full_name
            if entry.directory?
              unzipped_folders << dest.gsub('tmp/', '')
              FileUtils.rm_rf dest unless File.directory? dest
              FileUtils.mkdir_p dest, :mode => entry.header.mode, :verbose => false
            elsif entry.file?
              FileUtils.rm_rf dest unless File.file? dest
              File.open dest, "wb" do |f|
                f.print entry.read
              end
              FileUtils.chmod entry.header.mode, dest, :verbose => false
            elsif entry.header.typeflag == '2' #Symlink!
              File.symlink entry.header.linkname, dest
            end
            dest = nil
          end
        end
        puts "Finished unzipping tar at #{args[:tar_path]}"
        @unzipped_folder = unzipped_folders.first.chomp('/')
      end
    
      task :compile_protos, [:output_dir] do |t, args|
        puts 'Generating Protos'
        FileUtils.mkdir_p(args[:output_dir])
        system("protoc tmp/#{@unzipped_folder}/*/*.proto --ruby_out=#{args[:output_dir]} -I tmp/#{@unzipped_folder}")
      end
    
      def help_text
        <<~HEREDOC
          Usage: rake enova_protobufs:generate[release, github_archive_url, output_dir]
          github_archive_url (default) -> #{DEFAULT_ARCHIVE_URL}
          output_dir (default) -> #{DEFAULT_OUTPUT_DIR}
        HEREDOC
      end
    end

Link to Open Source project.