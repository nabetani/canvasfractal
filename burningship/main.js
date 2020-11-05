'use strict';

const W = 800;
const ZOOM = 0.8;

const elementNumValue = (id) => {
  const el = document.getElementById(id);
  return parseFloat(el.value);
};

const setElementValue = (id, val) => {
  const el = document.getElementById(id);
  el.value = val;
};


const depth = (repeat, x, y) => {
  const cr = x;
  const ci = y;
  let zr = 0;
  let zi = 0;
  for (let i = 0; i < repeat; ++i) {
    let azr = Math.abs(zr);
    let azi = Math.abs(zi);
    zr = azr * azr - azi * azi + cr;
    zi = 2 * azi * azr + ci;
    const d2 = zr * zr + zi * zi;
    if (8 < d2) {
      return i;
    }
  }
  return Infinity;
};

const colorAt = (repeat, x, y) => {
  const d = depth(repeat, x, y);
  return d == Infinity
    ? 0
    : ((((d | 0) * 41) & 0x7f) + 0x80) * 0x10101;
};

const draw = (ctx, cx, cy, width) => {
  const data = new Uint8ClampedArray(W * W * 4);
  console.log("start drawing.");
  const repeat = elementNumValue("repeat");
  for (let iy = 0; iy < W; ++iy) {
    for (let ix = 0; ix < W; ++ix) {
      let c = colorAt(
        repeat,
        (ix / W - 0.5) * width + cx,
        (iy / W - 0.5) * width + cy);
      data[(iy * W + ix) * 4 + 0] = c & 0xff;
      data[(iy * W + ix) * 4 + 1] = (c >> 8) & 0xff;
      data[(iy * W + ix) * 4 + 2] = (c >> 16) & 0xff;
      data[(iy * W + ix) * 4 + 3] = 256;
    }
  }
  console.log("ok.");
  ctx.putImageData(new ImageData(data, W, W), 0, 0);
}

const elCanvas = document.getElementById("canvas");

const update = () => {
  const ctx = elCanvas.getContext('2d');
  const cx = elementNumValue("x");
  const cy = elementNumValue("y");
  const width = elementNumValue("width");
  console.log(cx, cy, width);
  draw(ctx, cx, cy, width);
};

const newCenter = (relativeFP, oldCenter, oldW, z) => {
  let oldLeft = oldCenter - oldW / 2;
  let fp = oldLeft + oldW * relativeFP;
  let newLeft = (oldLeft - fp) * z + fp;
  return newLeft + oldW * z / 2;

};

const onClickCanvas = (e) => {
  const ix = e.offsetX;
  const iy = e.offsetY;
  const width = elementNumValue("width");
  const cx = newCenter(ix / W, elementNumValue("x"), width, ZOOM);
  const cy = newCenter(iy / W, elementNumValue("y"), width, ZOOM);
  setElementValue("x", cx);
  setElementValue("y", cy);
  setElementValue("width", width * ZOOM);
  update();
};

const main = () => {
  elCanvas.addEventListener('click', onClickCanvas, false);
  document.getElementById("draw-button").onclick = () => {
    update();
  }
  update();
};

main();
