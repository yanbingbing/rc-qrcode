const React = require('react');
const {QRCode, QRErrorCorrectLevel, QRCapacityTable, UTF8Array} = require('./qrcode');

const SUPPORT_CANVAS = !!document.createElement('canvas').getContext;
const SUPPORT_SVG = !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);

function getQRVersion(text, ecl) {
    let c = UTF8Array(text).length,
        eci = [QRErrorCorrectLevel.L, QRErrorCorrectLevel.M, QRErrorCorrectLevel.Q, QRErrorCorrectLevel.H],
        capacity = 0, version;

    //figure out what version can hold the amount of text
    for (var i=0,j=QRCapacityTable.length;i<j;i++) {
        capacity = QRCapacityTable[i][eci[ecl]];
        if (c < QRCapacityTable[i][eci[ecl]]) {
            version = i + 1;
            break;
        }
    }

    if (!version) {
        version = QRCapacityTable.length - 1;
    }

    if (capacity < c) {
        throw new Error("Content too long");
    }

    return version;
}

class ReactQRCode extends React.Component {
    render() {
        let renderer = this.props.render || this.props.renderer;
        if (!renderer || renderer === 'auto') {
            renderer = SUPPORT_SVG ? 'svg' : (SUPPORT_CANVAS ? 'canvas' : '');
        }
        if (renderer === 'canvas') {
            return <CanvasQRCode {...this.props} />;
        } else {
            return <SvgQRCode {...this.props} />;
        }
    }
}

class SvgQRCode extends React.Component {
    componentWillMount() {
        this.qrcode = new QRCode(getQRVersion(this.props.content, QRErrorCorrectLevel.M), QRErrorCorrectLevel.M);
        this.qrcode.addData(this.props.content);
        this.qrcode.make();
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.content !== this.props.content) {
            this.qrcode = new QRCode(getQRVersion(nextProps.content, QRErrorCorrectLevel.M), QRErrorCorrectLevel.M);
            this.qrcode.addData(nextProps.content);
            this.qrcode.make();
        }
    }

    render() {
        let props = this.props;
        let qrcode = this.qrcode;
        let count = qrcode.getModuleCount();
        let scale = +props.scale || 4;
        let margin = +props.margin || 20;
        let size = count * scale + margin * 2;

        let rects = [<rect key="background" x="0" y="0" width={size} height={size} style={{"fill":props.background, shapeRendering:"crispEdges"}}/>];

        let currenty = margin, currentx;
        for (let row = 0; row < count; row++) {
            currentx = margin;
            for (let col = 0; col < count; col++) {
                if (qrcode.isDark(row, col)) {
                    rects.push(<rect key={(row + '-' + col)} x={currentx} y={currenty} width={scale} height={scale} style={{"fill":props.foreground, shapeRendering:"crispEdges"}}/>);
                }
                currentx += scale;
            }
            currenty += scale;
        }

        return <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width={size} height={size}>{rects}</svg>;
    }
}

class CanvasQRCode extends React.Component {
    componentWillMount() {
        this.qrcode = new QRCode(getQRVersion(this.props.content, QRErrorCorrectLevel.M), QRErrorCorrectLevel.M);
        this.qrcode.addData(this.props.content);
        this.qrcode.make();
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.content !== this.props.content) {
            this.qrcode = new QRCode(getQRVersion(nextProps.content, QRErrorCorrectLevel.M), QRErrorCorrectLevel.M);
            this.qrcode.addData(nextProps.content);
            this.qrcode.make();
        }
    }

    componentDidMount() {
        this.draw();
    }

    componentDidUpdate() {
        this.draw();
    }

    draw() {
        let props = this.props;
        let qrcode = this.qrcode;
        let canvas = ReactDOM.findDOMNode(this);
        let ctx = canvas.getContext('2d');
        let count = qrcode.getModuleCount();
        let scale = +props.scale || 4;
        let margin = +props.margin || 20;
        let size = count * scale + margin * 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.height = canvas.height = size;
        canvas.style.width = canvas.width = size;
        ctx.fillStyle = props.background;
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = props.foreground;
        let currenty = margin, currentx;
        // draw in the canvas
        for (let row = 0; row < count; row++) {
            currentx = margin;
            for (let col = 0; col < count; col++) {
                if (qrcode.isDark(row, col)) {
                    ctx.fillRect(currentx, currenty, scale, scale);
                }
                currentx += scale;
            }
            currenty += scale;
        }
    }

    render() {
        return <canvas />;
    }
}

ReactQRCode.defaultProps = {
    renderer: "canvas",
    content: "",
    scale: 4,
    margin: 20,
    background: "white",
    foreground: "black"
};

ReactQRCode.propTypes = {
    renderer: React.PropTypes.oneOf(['canvas', 'svg', 'auto']),
    content: React.PropTypes.string,
    scale: React.PropTypes.oneOfType([
        React.PropTypes.number,
        React.PropTypes.string
    ]),
    margin: React.PropTypes.oneOfType([
        React.PropTypes.number,
        React.PropTypes.string
    ]),
    background: React.PropTypes.string,
    foreground: React.PropTypes.string
};

module.exports = ReactQRCode;