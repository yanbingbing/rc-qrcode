var webpack = require('webpack');

var config = {
    debug: false,
    entry: "./src/index",
    devtool: '#source-map',
    module: {
        loaders: [
            {test: /\.js$/, exclude: /node_modules/, loader:"babel"}
        ]
    },
    resolve: {
        extensions: ['', '.js']
    },
    externals: {
        'react': {
            "root": "React",
            "var": "window.React",
            "commonjs": "react",
            "commonjs2": "react",
            "amd": "react"
        },
        'react-dom': {
            "root": "ReactDOM",
            "var": "window.ReactDOM",
            "commonjs": "react-dom",
            "commonjs2": "react-dom",
            "amd": "react-dom"
        }
    }
};

if (process.env.NODE_ENV === 'production') {
    config.output = {
        path: './lib',
        filename: "index.min.js",
        sourceMapFilename: "[file].map",
        library: "ReactQRCode",
        libraryTarget: "umd"
    };
    config.plugins = [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ];
} else {
    config.output = {
        path: './lib',
        filename: "index.js",
        sourceMapFilename: "[file].map",
        library: "ReactQRCode",
        libraryTarget: "umd"
    };
}
module.exports = config;