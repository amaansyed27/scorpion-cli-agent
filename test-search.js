// Parse the saved Bing HTML
import * as cheerio from 'cheerio';
import fs from 'fs';

const html = fs.readFileSync('bing-debug.html', 'utf8');
const $ = cheerio.load(html);

console.log('li.b_algo:', $('li.b_algo').length);
console.log('.b_algo:', $('.b_algo').length);
console.log('ol#b_results:', $('ol#b_results').length);

// Find all h2 elements
console.log('\nAll h2 count:', $('h2').length);
$('h2').slice(0, 5).each((i, el) => {
    const text = $(el).text().trim();
    const link = $(el).find('a').attr('href');
    console.log(`h2 ${i + 1}:`, text.slice(0, 50), '|', link?.slice(0, 40));
});

// Try finding result containers
console.log('\n--- Looking for result patterns ---');
const patterns = ['[class*="algo"]', '[class*="result"]', '.b_tpcn', 'article'];
for (const p of patterns) {
    console.log(p + ':', $(p).length);
}
