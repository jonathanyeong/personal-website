import type { CollectionEntry } from 'astro:content';
import { formatInTimeZone } from 'date-fns-tz'

const formatDate = (date: Date): string => {
	return formatInTimeZone(date, 'Etc/UTC', 'yyyy-MM-dd');
}

const hasPubDatePassed = (post: CollectionEntry<"blog">) => {
  let todaysDate = new Date()
  todaysDate.setHours(0, 0, 0, 0)
  return formatDate(todaysDate) >= formatDate(post.data.pubDate);
};

export default hasPubDatePassed
