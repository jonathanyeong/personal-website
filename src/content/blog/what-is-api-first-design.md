---
pubDate: 2022-08-08
title: "Learning about API First Design"
description: "Learning note on what API First design is and why you'd use it"
featured: false
draft: false
tags: ["learning note"]
---

Building an API using an API first approach means that the API is the core deliverable. The API is treated like a core product that other products build on top of. Rather then products being built first then an API is slapped on top of them. There's another term - API design first which is focused on *how* you design your API. Whereas with API-first you focus on both design and building the API first.

I think of it like a restaurant. With API First you define exactly how the wait staff will send orders to the kitchen. In this case, we could say that wait staff will *only* use numbers and then the kitchen will have some mapping on their end to figure out what dish to cook. With API design first, the wait staff and kitchen will come together and figure out what the language is around an order. They may come up with a set of rules:

1. These set of abbreviations will mean this (e.g. bf = beef)
2. Numbers are okay or not. The kitchen will have some mapping on their end.

In API design first, it's all about communication. While API first is more rigid in how the API is defined in the first place. In both examples, building and API was about defining a contract - there are overlaps between the two approaches.

It feels like API first and API design first really go hand in hand. Building an API that interfaces with other teams means you need to discuss design even if you're building API first. I would love some examples where this isn't the case!

Finally, one way to describe your API/create a contract is through a specification language like [OpenAPI](/what-is-open-api).

## Resources
- [API-First vs. API Design-First: A Comprehensive Guide by Spotlight](https://blog.stoplight.io/api-first-vs.-api-design-first-a-comprehensive-guide)
- [Design-First Approach to API Development: How to Implement and Why It Works by InfoQ](https://www.infoq.com/articles/design-first-api-development/)