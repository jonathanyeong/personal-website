---
pubDate: 2023-05-19
updatedDate: 2023-06-07
title: "Developer productivity with Github Codespaces"
description: "My journey into improving my development workflow"
featured: false
draft: false
---

During my time at Shopify, I had the opportunity to work with a cloud development environment - and I was sold. Since then, I set out trying to recreate a similar experience for my personal development. Enter, [Github Codespaces](https://github.com/features/codespaces). I'd like to share my thoughts on using Codespaces and why I believe it will greatly benefit developer productivity.

## Exploring Codespaces: My Motivations

There are a couple of reasons why I decided to explore GitHub Codespaces:

1. **Escape from Bare Metal Setup**: I'm tired of installing and managing specific versions of Ruby, Node, Postgresql across my various projects.
2. **Onboarding Developers**: one of my aspirations is to run my own company, I wanted to explore how cloud development environments like Codespaces could facilitate the smooth onboarding of new engineers.

## The Github Codespaces Workflow
Firstly, install the Github CLI tool. Being able to use the terminal over the browser has significantly streamlined my experience. Once authenticated with the Github CLI, my workflow is as follows:

1. **Creating a Codespace:** Initially, I needed to create a Codespace. Note that if you cloned a project and you're in that folder, the Github CLI tool will use that project as the default

```bash
gh codespace create
```

2. **Getting to Work:** To start working on my application, I ran the following command, selecting the Codespace I had just created. There's a short delay as the environment is being set up:

```bash
gh codespace code
```

3. **Astro Aside:** Since I'm running the Codespace for my Astro site, I made an update to the `dev` command in the `package.json` file:

```bash
astro dev --host
```

This configuration binds the Astro local server to any IP, allowing proper connection when Codespace forwards the localhost port.

4. **Codespace Logging:** I also experimented with [Dotfiles](https://github.com/jonathanyeong/dotfiles) for my Codespace, which customize the Codespace developer environment. The Codespace logs proved invaluable for debugging my changes as the Codespace started:

```bash
gh codespace logs
```

## Initial Considerations

Based on my early experience, here are a few considerations regarding Codespaces:

- **Overkill for Simple Projects**: Codespaces is overkill for simple projects like my Astro blog. Given the minimal version dependencies and longer startup time compared to setting up my Astro project directly, it doesn't give that much benefit.
- **Treat Codespaces as Ephemeral**: It's important to treat Codespaces as ephemeral environments. That means commit often! Any uncommitted changes will be lost when the Codespace is destroyed (which occurs by default every 30 days).

## The Untapped Potential

I'm totally bought into the idea of cloud development environments. Github Codespace is one option there's also others such as [Gitpod](https://www.gitpod.io/).

Imagine this situation, you're starting a new job, excitedly setting up a fresh codebase, only to encounter a mysterious, undocumented error. You turn to your onboarding buddy for help. They speak the dreaded words, "weird - works on my machine". A response that leaves you navigating a labyrinth of debugging all by your lonesome. Okay I'm being a little dramatic, but we've all experienced these "works on my machine" moments that can send you spiraling.

With a cloud developer environment like Codespaces, someone can get their project up and running in minutes rather then days. Think about the time and headache saved! These environments can be used for more then onboarding too. You could use them as developer previews, sharing a URL of your app running in the Codespace so anyone can test your changes.

While I haven't found a project to fully utilize Codespaces yet, I'm psyched to keep exploring it. Stay tuned, I'll keep this post updated.