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

/**
 * A recursive function that Extract images and links from the specified URL.
 * @param {string} url - The starting URL.
 * @param {number} maxDepth - The depth parameter passed from the cli.
 * @param {number} currentDepth - The current depth.
 */
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
    if (error.response && error.response.status === 404) {
      console.error(`Error crawling ${url}: 404 Not Found`);
    } else {
      console.error(`Error crawling ${url}:`, error.message);
    }
  }
}

/**
 * The Main function for the file, get the cli parameters,
 * calls the crawl function and create the json file from the results array.
 */
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
