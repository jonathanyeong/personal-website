---
pubDate: 2022-04-05
updatedDate: 2022-04-08
title: "Learning about Open API"
description: "Learning note on what Open API is and what it's used for"
featured: false
draft: false
tags: ["learning note"]
---

OpenAPI is a specification (OpenAPI Specification (OAS)) that is a way to define how you interact with an API without needing to understand implementation logic. You describe the capabilities of the service and someone can understand what it does without needing to look at source code, documentation, or network traffic inspection. The OpenAPI definition can then be used by documentation tools or code gen tools to display the docs or generate servers and clients respectively.

In other words, OAS is a standardized way of describing your API that isn't tied to any programming language. A reason you would write an OAS document is to help during the API design lifecycle ([reference](https://www.openapis.org/what-is-openapi)). You can use this document with a tool such as [Optic](https://www.useoptic.com/docs/diff-openapi) to prevent things like breaking changes from your implementation versus the design.

### Backlinks
- [Learning about API First Design](/what-is-api-first-design)