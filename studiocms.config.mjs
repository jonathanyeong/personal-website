import { defineStudioCMSConfig } from 'studiocms/config';
import html from '@studiocms/html';
import md from '@studiocms/md';
import github from '@studiocms/github';
import blog from '@studiocms/blog';

export default defineStudioCMSConfig({
    plugins: [
        html(),
        md(),
        github(),
        blog()
    ],
});