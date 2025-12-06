import GhostAdminApi from '@tryghost/admin-api';

export const ghostClient = new GhostAdminApi({
    url: 'https://jonathan-yeong.ghost.io',
    key: import.meta.env.GHOST_ADMIN_API_KEY,
    version: 'v6.0',
});