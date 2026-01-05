import getAllPosts, { type BlogPost } from './getAllPosts';

export interface TopicWithPosts {
  topic: string
  posts: BlogPost[]
}

export default async function getTopicsWithPosts(): Promise<TopicWithPosts[]> {
  const allPosts = await getAllPosts();
  const topicMap = new Map<string, BlogPost[]>();

  for (const post of allPosts) {
    for (const topic of post.data.topics) {
      const normalizedTopic = topic.toLowerCase().trim()
      let posts = topicMap.get(normalizedTopic)
      if (posts) {
        posts.push(post)
      } else {
        posts = [post]
      }
      topicMap.set(normalizedTopic, posts)
    }
  }

  return Array.from(topicMap, ([topic, posts]) => ({
    topic,
    posts,
  }));
}
