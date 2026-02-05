/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://productcasestudies.com',
  generateRobotsTxt: false, // We have a custom robots.txt
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*'],
  transform: async (config, path) => {
    // Custom priority for different pages
    let priority = 0.7;
    let changefreq = 'weekly';

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path === '/case-studies' || path === '/categories') {
      priority = 0.9;
      changefreq = 'daily';
    } else if (path.startsWith('/case-studies/')) {
      priority = 0.8;
    } else if (path.startsWith('/categories/')) {
      priority = 0.8;
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};
