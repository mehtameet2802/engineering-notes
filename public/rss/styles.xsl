<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="/rss/channel/title"/> — RSS feed</title>
        <style>
          :root { --bg:#f9f9ff; --card:#fff; --text:#141b2b; --muted:#3e4947; --line:#bdc9c6; --accent:#005c55; }
          @media (prefers-color-scheme: dark) { :root { --bg:#0f141c; --card:#171c24; --text:#dee2ee; --muted:#bbcac6; --line:#3c4947; --accent:#4fdbc8; } }
          * { box-sizing: border-box; }
          body { margin:0; background:var(--bg); color:var(--text); font:16.5px/1.7 Inter, system-ui, sans-serif; }
          main { width:min(100% - 2rem, 44rem); margin:0 auto; padding:3rem 0 4rem; }
          h1 { font:400 clamp(2rem,6vw,2.75rem)/1.15 Newsreader, Georgia, serif; margin:0 0 .5rem; }
          p { color:var(--muted); margin:.5rem 0; }
          a { color:var(--accent); }
          .note { border:1px solid var(--line); border-radius:.5rem; background:var(--card); padding:1rem 1.25rem; margin:1.5rem 0 2rem; font-size:.95rem; }
          code { font:.875em ui-monospace, Menlo, Consolas, monospace; word-break:break-all; }
          ul { list-style:none; padding:0; margin:0; display:grid; gap:1rem; }
          li { border:1px solid var(--line); border-radius:.5rem; background:var(--card); padding:1.1rem 1.25rem; }
          li h2 { font:400 1.35rem/1.3 Newsreader, Georgia, serif; margin:0; }
          li h2 a { color:var(--text); text-decoration:none; }
          li h2 a:hover { color:var(--accent); }
          small { color:var(--muted); }
        </style>
      </head>
      <body>
        <main>
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p><xsl:value-of select="/rss/channel/description"/></p>
          <div class="note">
            <strong>This is an RSS feed.</strong> Copy this page’s address into a feed reader to follow new writing:
            <p><code><xsl:value-of select="/rss/channel/link"/>rss.xml</code></p>
            <a href="{/rss/channel/link}">Visit the website →</a>
          </div>
          <xsl:choose>
            <xsl:when test="count(/rss/channel/item) = 0">
              <p>Nothing has been published yet. New articles will appear here.</p>
            </xsl:when>
            <xsl:otherwise>
              <ul>
                <xsl:for-each select="/rss/channel/item">
                  <li>
                    <h2><a href="{link}"><xsl:value-of select="title"/></a></h2>
                    <small><xsl:value-of select="substring(pubDate, 6, 11)"/></small>
                    <p><xsl:value-of select="description"/></p>
                  </li>
                </xsl:for-each>
              </ul>
            </xsl:otherwise>
          </xsl:choose>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
