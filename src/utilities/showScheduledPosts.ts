import type { CollectionEntry } from 'astro:content';
import { formatInTimeZone } from 'date-fns-tz'

const formatDate = (date: Date): string => {
	return formatInTimeZone(date, 'Etc/UTC', 'yyyy-MM-dd');
}

const hasPubDatePassed = (pubDate: Date): boolean => {
  let todaysDate = new Date()
  todaysDate.setHours(0,0,0,0)
  return formatDate(todaysDate) >= formatDate(pubDate);
}

const showScheduledPosts = (post: CollectionEntry<"blog">) => {
  return import.meta.env.DEV || hasPubDatePassed(post.data.pubDate);
};


export default showScheduledPosts
