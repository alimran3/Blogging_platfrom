import embedService from './services/embedService.js';

const url = 'https://www.facebook.com/share/p/1Ay4KA1BL2/';
console.log('Testing Facebook URL:', url);

try {
  const result = await embedService.parseEmbed(url);
  console.log('Result type:', result.type);
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}

process.exit(0);
