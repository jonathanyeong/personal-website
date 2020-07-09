+++
author = ""
date = 2020-07-09T07:00:00Z
draft = true
hero = ""
tags = []
title = "Building a blog with Phoenix: Getting started"
type = ""

+++
Today, I want to show you how to start building a blog using Phoenix. You can find the source code here: [https://github.com/jonathanyeong/phoenix_blog/tree/v0.0.1](https://github.com/jonathanyeong/phoenix_blog/tree/v0.0.1 "https://github.com/jonathanyeong/phoenix_blog/tree/v0.0.1"). We are using Phoenix version 1.5.3 and Elixir version 1.10.3. We will cover:

* [Project setup](#project-setup)
* [Migrations](#generate-migration)
* [Routes](#add-routes)
* [The Post Controller - index, new, and create](#add-the-post-controller)
* [Post Views & Templates](#add-post-view-templates)

***

## Project Setup

After installing Phoenix and Elixir (see [Phoenix docs](https://hexdocs.pm/phoenix/installation.html#content)). Setup your new blog application.

    mix phx.new phoenix_blog
    cd phoenix_blog/
    mix ecto.create

## Generate migration

Firstly, we need a Post table in the database. We can use the mix task `phx.gen.schema` to generate a schema and a migration file ([see the docs](https://hexdocs.pm/phoenix/Mix.Tasks.Phx.Gen.Schema.html) for more info). The schema is how we represent information from the database. While, the migration contains the commands that run on the database itself

    mix phx.gen.schema Post posts content:text title:string
    mix ecto.migrate

## Add Routes

Now that we have the Post schema, we need to add routes to our app so that we can view and create a post on a website. We will be using `resources` to generate resourceful routes for us.

In `lib/phoenix_blog_web/router.ex`

    scope "/", PhoenixBlogWeb do
    	resources "/posts", PostController
    end

If you run `mix phx.routes`. You should see:

    post_path  GET     /                                      PhoenixBlogWeb.PostController :index
    post_path  GET     /posts                                 PhoenixBlogWeb.PostController :index
    post_path  GET     /posts/:id/edit                        PhoenixBlogWeb.PostController :edit
    post_path  GET     /posts/new                             PhoenixBlogWeb.PostController :new
    post_path  GET     /posts/:id                             PhoenixBlogWeb.PostController :show
    post_path  POST    /posts                                 PhoenixBlogWeb.PostController :create
    post_path  PATCH   /posts/:id                             PhoenixBlogWeb.PostController :update
               PUT     /posts/:id                             PhoenixBlogWeb.PostController :update
    post_path  DELETE  /posts/:id                             PhoenixBlogWeb.PostController :delete

## Add the Post Controller

All of these routes point to a nonexistent Post Controller. Lets create one and add the following code.

    # lib/phoenix_blog_web/controllers/post_controller.ex
    defmodule PhoenixBlogWeb.PostController do
      use PhoenixBlogWeb, :controller
    
      alias PhoenixBlog.{
        Post,
        Repo
      }
    
      def index(conn, _params) do
    	posts = Post |> Post.ordered() |> Repo.all()
        render(conn, "index.html", posts: posts)
      end
    
      def new(conn, _params) do
        changeset = Post.changeset(%Post{}, %{})
        render(conn, "new.html", changeset: changeset)
      end
    
      def create(conn, %{"post" => post_params} = _params) do
    	changeset = Post.changeset(%Post{}, post_params)
    	case Repo.insert(changeset) do
    	  {:ok, _log} ->
    	    conn
    	    |> put_flash(:info, "Success - created a Post!")
    	    |> redirect(to: Routes.post_path(conn, :index))
    	  {:error, changeset} ->
    	    conn
    	    |> put_flash(:error, "failure couldn't create post")
    	    |> render(:new, changeset: changeset)
    	end
      end
    end

_Jump to_ [_Post View & Templates_](#add-post-view-templates)_._

### Breakdown

    defmodule PhoenixBlogWeb.PostController do
      ...
    end

Controllers are just modules in Elixir. The module name ( `PostController` ) needs to match the filename `post_controller.ex`.

    use PhoenixBlogWeb, :controller

`use` will require and inject the `Phoenix.Controller` code and the `Plug.Conn` into our Post Controller. It does this by calling the macro `__using()__` . You can see the code injected [here](https://github.com/phoenixframework/phoenix/blob/master/lib/phoenix/controller.ex#L165).

    alias PhoenixBlog.{
      Post,
      Repo
    }

`Alias` is used to define shortcuts. Instead of writing `[PhoenixBlog.Post](<http://phoenixblog.Post>)` we can instead write `Post`.

    def index(conn, _params) do
      posts = Repo.all(Post)
      render(conn, "index.html", posts: posts)
    end

The `index` method takes in a `conn` and a `params` argument. `conn` comes from [Plug.Conn](https://hexdocs.pm/plug/Plug.Conn.html). Which was injected above via `use PhoenixBlogWeb, :controller`. `conn` is a module that defines low level functions such as request information. Next is `params` , since we aren't using this argument we'll signify that we're not using it by prepending `_`. We then call `Repo.all(Post)` to pull all the Posts from the database. Next, we assign these posts to a variable, `posts`, which we can access in the index Post view via `@posts`.

    def new(conn, _params) do
      changeset = Post.changeset(%Post{}, %{})
      render(conn, "new.html", changeset: changeset)
    end

The `new` method creates a `changeset` that is passed to the `new` view. The changeset will be used to help create the form. A changeset in Elixir will only allow data with specific information to go through. It will also complain if it expects data but doesn't receive it. The Post `changeset/2` method takes in a Post struct and some attributes. Since we're creating a new Post, there are no attributes so instead we'll pass in an empty map.

    def create(conn, %{"post" => post_params} = _params) do
      changeset = Post.changeset(%Post{}, post_params)
      case Repo.insert(changeset) do
        {:ok, _log} ->
          conn
          |> put_flash(:info, "Success - created a Post!")
          |> redirect(to: Routes.post_path(conn, :index))
        {:error, changeset} ->
          conn
          |> put_flash(:error, "failure couldn't create post")
          |> render(:new, changeset: changeset)
      end
    end

The create method is pretty big so let's break this down to smaller parts.

    ...%{"post" => post_params} = _params

The first line of the method uses Elixir's pattern matching to assign anything found in `params["post"]` to `post_params`. The pattern matching also allows us to skip `nil` checks. If `"post"` doesn't exist in the `params` map then the left hand side will not match the right hand side and it will throw an error.

    changeset = Post.changeset(%Post{}, post_params)

We've seen `changeset` being used for the `new` route. In the `create` route we're passing in the `post_params` instead of an empty map. This creates a changeset that is populated by the form data. Which we'll save to the database via:

    Repo.insert(changeset)

`Repo.insert/1` will return one of two cases.

    {:ok, _log} ->
      conn
      |> put_flash(:info, "Success - created a Post!")
      |> redirect(to: Routes.post_path(conn, :index))

On a successful insert into the database, it will display a flash message and redirect to the index page where all the posts will be displayed.

    {:error, changeset} ->
      conn
      |> put_flash(:error, "failure couldn't create post")
      |> render(:new, changeset: changeset)

On an error with inserting into the database, it will display a flash message and show the new form with the changes we attempted to save.

## Add Post View & Templates

Phoenix has a strong naming convention. So each of the templates live in the `post` directory. And the view is a `post` view. Phoenix will link these files to the Post Controller. Templates get compiled into the view and the view gets rendered in the form of a HTML page (or JSON).

    # lib/phoenix_blog_web/views/post_view.ex
    defmodule PhoenixBlogWeb.PostView do
      use PhoenixBlogWeb, :view
    end
    
    # lib/phoenix_blog_web/templates/index.html.eex.
    <h1>Blog Post</h1>
    <%= link "+ Add new post", to: Routes.post_path(@conn, :new) %>
    <%= for post <- @posts do %>
    <h2><%= post.title %></h2>
    <p><%= post.content%></p>
    <% end %>
    
    # lib/phoenix_blog_web/templates/post/new.html.eex
    <h1>New Blog Post</h1>
    
    <%= form_for @changeset, Routes.post_path(@conn, :create), fn f -> %>
      <label>
        title:
      </label>
      <%= text_input f, :title %>
    
      <label>
        Content:
      </label>
      <%= textarea f, :content %>
    
      <%= submit "Submit!" %>
    <% end %>

### Breakdown

    # lib/phoenix_blog_web/views/post_view.ex
    defmodule PhoenixBlogWeb.PostView do
      use PhoenixBlogWeb, :view
    end

The Post view has a similar structure to the Post controller. `use` will inject the [Phoenix.View code](https://github.com/phoenixframework/phoenix/blob/master/lib/phoenix/view.ex#L148) from Phoenix.

    # lib/phoenix_blog_web/templates/index.html.eex.
    <h1>Blog Post</h1>
    <%= link "+ Add new post", to: Routes.post_path(@conn, :new) %>
    <%= for post <- @posts do %>
    <h2><%= post.title %></h2>
    <p><%= post.content%></p>
    <% end %>

The index view will add a link that routes to the new Post path. It will also loop through all the `posts` and display the title and content. The `@posts` variable was set in the index method in the Post Controller.

    # lib/phoenix_blog_web/templates/post/new.html.eex
    <h1>New Blog Post</h1>
    
    <%= form_for @changeset, Routes.post_path(@conn, :create), fn f -> %>
      <label>
        title:
      </label>
      <%= text_input f, :title %>
    
      <label>
        Content:
      </label>
      <%= textarea f, :content %>
    
      <%= submit "Submit!" %>
    <% end %>

The form inside `new.html` will use the `changeset` variable we passed in via the function call `render(conn, "new.html", changeset: changeset)` . When the user clicks on submit this will route the form information to the Post create route (which we have yet to add). If you want more information on the types of input fields, see the [Phoenix docs](https://hexdocs.pm/phoenix_html/Phoenix.HTML.Form.html).

## Conclusion

Phew, we finally made it! Now if you start your webserver `mix phx.server` and navigate to `localhost:4000/posts` you should see `Blog Post` as a header. By understanding the basics of creating a post you can then apply the same patterns to the rest of the routes. Try implementing the `update` and `edit` route next! I hope this tutorial has highlighted how easy it is to get started with Phoenix. If you enjoyed this article please leave a comment below. Happy coding!