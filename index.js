'use strict';

let congress= require('./congress'),
    senate = require('./senate');

Promise.all([
    congress(),
    senate()
]).then(() => {
   console.log('finish ...');
}).catch(err => {
    console.error(err, err.stack);
});
