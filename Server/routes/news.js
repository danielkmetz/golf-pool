const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

router.get('/scrape-article', async (req, res) => {
  const { type, apiUrl, id } = req.query;
  console.log('📨 Incoming request to /scrape-article');
  console.log('🧾 Query params:', { type, apiUrl, id });

  try {
    const articleUrl = apiUrl;
    console.log('🌐 Fetching from:', articleUrl);

    const response = await axios.get(articleUrl);
    const contentType = response.headers['content-type'];

    if (contentType.includes('application/json')) {
      const data = response.data;
      console.log('📦 Top-level keys in response:', Object.keys(data));

      // 🎥 Handle direct video structure (e.g., /video/clips/:id)
      if (Array.isArray(data.videos) && data.videos.length > 0) {
        const video = data.videos[0];
        const videoUrl = video.links?.source?.mezzanine?.href;

        console.log('🎥 Extracted video from videos[0]:', video.headline);
        return res.json({
          type: 'media',
          title: video.headline,
          description: video.description,
          thumbnail: video.thumbnail,
          url: videoUrl,
        });
      }

      // 🎥 Handle direct video object structure (fallback)
      if (data.id && data.source?.mezzanine?.href) {
        console.log('🎥 Detected video clip format with mezzanine link');
        return res.json({
          type: 'media',
          title: data.title,
          description: data.description,
          thumbnail: data.thumbnail,
          url: data.source.mezzanine.href,
        });
      }

      // 📰 Handle articles inside headlines[0]
      const headline = data.headlines?.[0];
      if (headline) {
        console.log('📰 Found headline:', headline.headline);
        console.log('👤 Author/byline:', headline.byline || headline.source || 'N/A');

        const storyContent = headline.story;
        const embeddedVideo = headline.video?.[0];
        const videoUrl = embeddedVideo?.links?.source?.mezzanine?.href;

        const html = `
          <div class="article-header"><h1>${headline.headline}</h1></div>
          <div class="authors">${headline.byline || headline.source || ''}</div>
          <div class="article-body">${storyContent || '<p>No story content available.</p>'}</div>
        `;

        return res.json({
          type: 'html',
          headline: headline.headline,
          author: headline.byline,
          content: html,
          ...(videoUrl && {
            video: {
              title: embeddedVideo.title,
              description: embeddedVideo.description,
              thumbnail: embeddedVideo.thumbnail,
              url: videoUrl,
            },
          }),
        });
      }

      console.warn('🛑 No recognizable format matched in JSON response.');
    }

    // 🌐 Cheerio fallback for ESPN HTML article pages
    console.log('🔍 Attempting HTML scraping fallback...');
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('h1.headline, .article-header h1').text().trim();
    const paragraphs = $('section[class*="article"], .article-body, .article__content')
      .find('p')
      .map((i, el) => $(el).text().trim())
      .get();
    const content = paragraphs.join('\n\n');
    const author = $('[class*="author"], [class*="byline"]').first().text().trim();
    const publishedTime = $('meta[property="article:published_time"]').attr('content');
    const imageUrl = $('meta[property="og:image"]').attr('content');

    if (!title || !content) {
      return res.status(404).json({ error: 'Could not extract article content from HTML.' });
    }

    return res.json({
      type: 'html-scrape',
      title,
      author,
      publishedTime,
      imageUrl,
      content,
    });

  } catch (err) {
    console.error('❌ Scraping error:', err.message);
    if (err.response?.data) {
      console.error('🧩 Error response data:', err.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch article or media' });
  }
});

module.exports = router;
