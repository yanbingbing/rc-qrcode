# rc-qrcode [![](http://img.shields.io/npm/v/rc-qrcode.svg)](https://npmjs.org/package/rc-qrcode)

QRCode Component for React.

## Install

```sh
npm install rc-qrcode --save
```

## Usage

```jsx
const React = require('react');
const ReactDOM = require('react-dom');
const QRCode = require('rc-qrcode');

ReactDOM.render(<QRCode renderer="canvas" content="http://onbing.com" scale="10" margin="20" background="white" foreground="green" />, container);
```

## Props

 Option | Type | Default | Description
------- | ---- | ------- | -----------
renderer | enum("canvas", "svg", "auto") | "auto" | renderer for draw image
scale | number | 4 | block size
margin | number | 20 | image margin
background | string | "white" | background color
foreground | string | "black" | foreground color