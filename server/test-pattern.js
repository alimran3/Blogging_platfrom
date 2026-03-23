const pattern = /facebook\.com\/(?:photo\.php\?fbid=|[\w.]+\/(?:posts|photos|videos|share)\/|share\/)/;
const url = 'https://www.facebook.com/share/p/1Ay4KA1BL2/';
console.log('Test URL:', url);
console.log('Pattern matches:', pattern.test(url));
console.log('Expected: true');
