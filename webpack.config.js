const path = require('path');

module.exports = {
    entry: './RawContract.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
