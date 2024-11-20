# Webselenese Home Assigment

This is the home assignment for the Webselenese Full Stack Developer Position.

This is the description given to me about it:

# Web Crawler Exercise

The goal of this exercise is to build a web crawler CLI. Please write the application in NodeJS.

The usage should be:
node crawler.js <url: string> <depth: number>
Description:
Given a URL, the crawler will scan the webpage for any images, continue to every link inside that page and scan it as well.
The crawling should stop once <depth> is reached. depth=3 means we can go as deep as 3 pages from the source URL (denoted by the <url> param), and depth=0 is just the first page.

Results should be saved into a results.json file in the following format:
`   {
        results: [
            {
                imageUrl: string,
                sourceUrl: string // the page url this image was found on
                depth: number // the depth of the source at which this image was found on
            }
        ]
    }
  `

Web crawler introduction can be found here: https://en.wikipedia.org/wiki/Web_crawler

Good luck!
