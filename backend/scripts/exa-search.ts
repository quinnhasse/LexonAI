import { Exa } from "exa-js";
import { config } from "../src/config/env.ts"

const exa = new Exa(config.EXA_API_KEY);

async function runSearch() {
  const query = "What is the TCP protocol structure?";

  const results = await exa.search(query, {
    type: "deep",      // high-quality neural search with highlights
    numResults: 5,     // adjust as needed
    contents: false    // disable full page text payload
  });

  console.log(results);
  // results.results.forEach((r, i) => {
  //   console.log(`\nResult ${i + 1}:`);
  //   console.log("URL:", r.url);
  //   console.log("Title:", r.title);
  //
  //   if (r.highlights && r.highlights.length > 0) {
  //     console.log("Matched Passages:");
  //     r.highlights.forEach(h => console.log("  →", h));
  //   } else {
  //     console.log("  (No highlights)");
  //   }
  // });
}

runSearch().catch(console.error);
