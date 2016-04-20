const React = require('react');
const {QRCode, QRErrorCorrectLevel, UTF8Array} = require('./qrcode');

const SUPPORT_CANVAS = !!document.createElement('canvas').getContext;
const SUPPORT_SVG = !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);

const QRCapacityTable = [
    [17,14,11,7]
    ,[32,26,20,14]
    ,[53,42,32,24]
    ,[78,62,46,34]
    ,[106,84,60,44]
    ,[134,106,74,58]
    ,[154,122,86,64]
    ,[192,152,108,84]
    ,[230,180,130,98]
    ,[271,213,151,119]
    ,[321,251,177,137]//11
    ,[367,287,203,155]
    ,[425,331,241,177]
    ,[458,362,258,194]
    ,[520,412,292,220]
    ,[586,450,322,250]
    ,[644,504,364,280]
    ,[718,560,394,310]
    ,[792,624,442,338]
    ,[858,666,482,382]
    ,[929,711,509,403]
    ,[1003,779,565,439]
    ,[1091,857,611,461]
    ,[1171,911,661,511]//24
    ,[1273,997,715,535]
    ,[1367,1059,751,593]
    ,[1465,1125,805,625]
    ,[1528,1190,868,658]//28
    ,[1628,1264,908,698]
    ,[1732,1370,982,742]
    ,[1840,1452,1030,790]
    ,[1952,1538,1112,842]//32
    ,[2068,1628,1168,898]
    ,[2188,1722,1228,958]
    ,[2303,1809,1283,983]
    ,[2431,1911,1351,1051]//36
    ,[2563,1989,1423,1093]
    ,[2699,2099,1499,1139]
    ,[2809,2213,1579,1219]
    ,[2953,2331,1663,1273]//40
];

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

function toInt(val) {

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
    scale: oneOfType([
        React.PropTypes.number,
        React.PropTypes.string
    ]),
    margin: oneOfType([
        React.PropTypes.number,
        React.PropTypes.string
    ]),
    background: React.PropTypes.string,
    foreground: React.PropTypes.string
};

module.exports = ReactQRCode;