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


const colCount = (1 << 10);
const COLMAP = (() => {
  let c = new Uint32Array(colCount);
  const delta = 6 / 29;
  const f_inv = (f) => {
    return delta < f
      ? f * f * f
      : (f - 16 / 116) * 3 * delta * delta;
  };
  const nonlinear = (x0) => {
    const x = Math.max(0, Math.min(1, x0));
    return x < 0.0031308
      ? x * 12.92
      : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  };
  const yn = 0.578;
  const xn = 0.549;
  const zn = 0.629;
  const AB = 100;
  for (let i = 0; i < colCount; ++i) {
    const th = i * 2 * Math.PI / colCount;
    const a = Math.cos(th) * AB;
    const b = Math.sin(th) * AB;
    const L = 80;
    const fy = (L + 16) / 116;
    const fx = fy + a / 500;
    const fz = fy - b / 200;
    const y = yn * f_inv(fy);
    const x = xn * f_inv(fx);
    const z = zn * f_inv(fz);
    const rr = nonlinear(3.24 * x - 1.54 * y - 0.499 * z);
    const rg = nonlinear(-0.969 * x + 1.88 * y + 0.0415 * z);
    const rb = nonlinear(0.0557 * x - 0.204 * y + 1.057 * z);
    const m = 255.4;// / Math.max(rr, rg, rb);
    c[i] = Math.round(rr * m) +
      Math.round(rg * m) * 0x100 +
      Math.round(rb * m) * 0x10000;
  }
  return c;
})();

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
    if (4 < d2) {
      return 0 | (i * (1 << 7) - Math.ceil((d2 - 4) * (1 << 2)));
    }
  }
  return Infinity;
};

const colorAt = (repeat, x, y) => {
  const d = depth(repeat, x, y);
  // const d = ((x * x + y * y) * 256) | 0;
  return d == Infinity
    ? 0
    : COLMAP[d & (colCount - 1)];
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
