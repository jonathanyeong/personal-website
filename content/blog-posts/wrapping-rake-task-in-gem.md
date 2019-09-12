+++
author = ""
date = "2019-09-09T05:00:00+00:00"
draft = true
hero = ""
title = "Writing the Ruby Proto Compiler task"
type = ""

+++
[Protocol Buffers](https://developers.google.com/protocol-buffers/) (Protobufs) are a great way to express a message. Written by Google, Protobufs give you the readability of JSON but the structure of something like XML. Using the `protoc` tool you can compile the protobufs into a language of your choosing.

A use case for Protobufs is sharing a domain model between multiple services in your ecosystem. However, this is a challenge with Ruby on Rails. Unlike Go, Ruby does not have a great way to import a shared protobuf library.

One way is to copy and paste the shared Protobuf repo into your Ruby on Rails codebase. Unfortunately, this means that every app will have to handle updating the Protobuf repo whenever there is a change.

Rather than committing the entire Protobuf repo, why don't we only commit the compile Protobufs? This is where the `ruby_proto_compiler` gem comes in.

This gem contains a rake task that will pull down a versioned Protobuf repository, unpack it, and compile the files. Here's what it looks like.

## Download Tar

```ruby
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
```

This task will download a tar from the releases section of your Protobuf Github project. You can then define where you wanted to place it with  `args[:dest_folder]`.

## Unpack Tar

```ruby
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
```

This is largely copied from [another blog post](http://dracoater.blogspot.com/2013/10/extracting-files-from-targz-with-ruby.html). The biggest change is setting the `unzipped_folder` instance variable. This will be used later to tell `protoc` where to find the protobufs.

## Compile Protos

```ruby
  task :compile_protos, [:output_dir] do |t, args|
    puts 'Generating Protos'
    FileUtils.mkdir_p(args[:output_dir])
    system("protoc tmp/#{@unzipped_folder}/*/*.proto --ruby_out=#{args[:output_dir]} -I tmp/#{@unzipped_folder}")
  end
```

This hooks into your system to run the `protoc` tool. It will find the protobufs using the `@unzipped_folder` variable and compile them to whatever your `args[:output_dir]` is.

## Putting it all together

Here's the full rake task:

```ruby
# frozen_string_literal: true
require 'open-uri'
require 'rubygems/package'
require 'zlib'

TAR_LONGLINK = '././@LongLink'  # http://dracoater.blogspot.com/2013/10/extracting-files-from-targz-with-ruby.html
TAR_EXT = '.tar.gz'.freeze
DEFAULT_OUTPUT_DIR = 'app/messages/'.freeze
DEFAULT_DOWNLOAD_DIR = 'tmp/'

namespace :ruby_proto_compiler do
  @unzipped_folder = ''

  desc 'Generate the Protos'
  task :generate, [:release, :github_archive_url, :output_dir] do |task, args|
    abort("Error: No Release Specified\n\n" + help_text) if args[:release].nil?
    args.with_defaults(:output_dir => DEFAULT_OUTPUT_DIR)

    destination_path = DEFAULT_DOWNLOAD_DIR + args[:release] + TAR_EXT
    download_url = args[:github_archive_url] + args[:release] + TAR_EXT

    Dir.mkdir(DEFAULT_DOWNLOAD_DIR) unless Dir.exist?(DEFAULT_DOWNLOAD_DIR)
    Rake::Task['ruby_proto_compiler:download_tar'].invoke(destination_path, download_url)
    Rake::Task['ruby_proto_compiler:unzip'].invoke(destination_path, download_url)
    Rake::Task['ruby_proto_compiler:compile_protos'].invoke(args[:output_dir])
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
      Usage: rake ruby_proto_compiler:generate[release, github_archive_url, output_dir]

      output_dir (default) -> #{DEFAULT_OUTPUT_DIR}
    HEREDOC
  end
end
```

## Usage

For more usage information checkout the [Github project](https://github.com/jonathanyeong/ruby_proto_compiler).