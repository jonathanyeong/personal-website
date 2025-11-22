import GhostContentAPI from '@tryghost/content-api';

export const ghostClient = new GhostContentAPI({
    url: 'https://jonathan-yeong.ghost.io',
    key: import.meta.env.CONTENT_API_KEY,
    version: 'v6.0',
});