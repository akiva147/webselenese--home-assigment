/**
    The email description
    Web Crawler Exercise
    The goal of this exercise is to build a web crawler CLI. Please write the application in NodeJS.

    The usage should be: 
    node crawler.js <url: string> <depth: number>
    Description:
    Given a URL, the crawler will scan the webpage for any images, continue to every link inside that page and scan it as well. 
    The crawling should stop once <depth> is reached. depth=3 means we can go as deep as 3 pages from the source URL (denoted by the <url> param), and depth=0 is just the first page. 

    Results should be saved into a results.json file in the following format:
    {
        results: [
            {
                imageUrl: string,
                sourceUrl: string // the page url this image was found on
                depth: number // the depth of the source at which this image was found on
            }
        ]
    }

    Web crawler introduction can be found here: https://en.wikipedia.org/wiki/Web_crawler

    Good luck!
 */

// First, I will create a function to extract the CLI parameters: the URL and the depth.
// Next, I will define global variables:
// - A Set to store visited URLs and ensure no duplicates.
// - An array to collect results, which will later be saved as a JSON file.
// I'll use the following libraries:
// - axios to fetch the webpage content.
// - cheerio to parse and traverse HTML elements.
// - fs to write the results to a JSON file.
// After parsing the CLI parameters, I'll pass them to a recursive function.
// This recursive function will:
// - Fetch the webpage.
// - Parse the HTML for images and links.
// - Store the image data and follow links, repeating the process until the specified depth is reached.

"use strict";

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const visitedUrls = new Set(); // To avoid re-crawling the same URL
const results = []; // Array of the collected image data for later

async function crawl(url, maxDepth, currentDepth = 0) {
  // Check if the currentDepth has exceeded maxDepth or if the url
  // is already in visitedUrls
  if (currentDepth > maxDepth || visitedUrls.has(url)) return;

  visitedUrls.add(url);
  console.log(`Crawling: ${url} at depth ${currentDepth}`);

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extract images
    $("img").each((_, img) => {
      const imageUrl = $(img).attr("src");
      if (imageUrl) {
        results.push({
          imageUrl: new URL(imageUrl, url).href, // Handle relative URLs
          sourceUrl: url,
          depth: currentDepth,
        });
        // uncommend to see every image added
        // console.log(`Found image: ${imageUrl} on ${url}`);
      }
    });

    // Extract links
    const links = [];
    $("a").each((_, link) => {
      const href = $(link).attr("href");
      if (href) {
        const absoluteUrl = new URL(href, url).href; // Handle relative URLs

        // check if the link is a valid url instead of href like:
        // javascript:void(0), javascript:print();, mailto:privacy@wikimedia.org, mailto:privacy@wikimedia.org
        // and others
        if (absoluteUrl.includes("http")) {
          links.push(absoluteUrl);
        }
      }
    });

    // Recurse into links
    for (const link of links) {
      await crawl(link, maxDepth, currentDepth + 1);
    }
  } catch (error) {
    console.error("Error crawling " + url + ": " + error.message);
    console.log("Error: ", error);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.error("Usage: node crawler.js <url: string> <depth: number>");
    process.exit(1);
  }

  // added Constructor to explicitly tell what type the variable is
  const url = new String(args[0]);
  const maxDepth = parseInt(args[1], 10);

  if (isNaN(maxDepth) || maxDepth < 0) {
    console.error("Depth must be a non-negative integer.");
    process.exit(1);
  }

  console.log(`Starting crawl on ${url} with depth ${maxDepth}`);
  await crawl(url, maxDepth);

  fs.writeFileSync("results.json", JSON.stringify({ results }, null, 2));
  console.log(`Crawl complete. Results saved to results.json.`);
}

main();
