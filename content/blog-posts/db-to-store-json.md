+++
author = ""
date = "2019-09-06T05:00:00+00:00"
draft = true
hero = ""
title = "DB to store JSON"
type = ""

+++
## Document DB

Fast, Scalable, highly available, and fully managed document database service. Essentially, it's built like Mongo DB so the tools you use for Mongo you can use with Document DB. With it though, you get native AWS scaling, performance and availability.

Writes are typically faster then traditional databases. "Amazon DocumentDB clusters can scale out to millions of reads per second with up to 15-read replicas."

Here's the page on [Document DB pricing](https://aws.amazon.com/documentdb/pricing/ "Document DB pricing").

Min storage is 10GB. Based on usage the storage will grow up to 64TB in increments of 10GB. You can scale horizontally by adding additional replica instances. It does not support MongoDB sharding. It has a different approach to scaling.

## Mongo DB 

We would have to host this in AWS through an EC2 instance. 