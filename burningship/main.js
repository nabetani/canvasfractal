const elementNumValue = (id) => {
  const el = document.getElementById(id);
  return parseFloat(el.value);
}

const depth = (x, y) => {
  const cr = x;
  const ci = y;
  let zr = 0;
  let zi = 0;
  for (let i = 0; i < 1000; ++i) {
    let azr = Math.abs(zr);
    let azi = Math.abs(zi);
    zr = azr * azr - azi * azi + cr;
    zi = 2 * azi * azr + ci;
    const d2 = zr * zr + zi * zi;
    if (4 < d2) {
      return i;
    }
  }
  return Infinity;
};

const colorAt = (x, y) => {
  const d = depth(x, y);
  const c =
    d == Infinity
      ? 0
      : (d & 0x7f) + 0x80;
  return {
    red: c,
    green: c,
    blue: c
  };
};

const draw = (ctx, cx, cy, width) => {
  const W = 800;
  const data = new Uint8ClampedArray(W * W * 4);
  console.log("start drawing.");
  for (let iy = 0; iy < W; ++iy) {
    for (let ix = 0; ix < W; ++ix) {
      let c = colorAt(
        (ix / W - 0.5) * width + cx,
        (iy / W - 0.5) * width + cy);
      data[(iy * W + ix) * 4 + 0] = c.red;
      data[(iy * W + ix) * 4 + 1] = c.green;
      data[(iy * W + ix) * 4 + 2] = c.blue;
      data[(iy * W + ix) * 4 + 3] = 256;
    }
  }
  console.log("ok.");
  ctx.putImageData(new ImageData(data, W, W), 0, 0);
}

const update = () => {
  const elCanvas = document.getElementById("canvas");
  const ctx = elCanvas.getContext('2d');
  const cx = elementNumValue("x");
  const cy = elementNumValue("y");
  const width = elementNumValue("width");
  console.log(cx, cy, width);
  draw(ctx, cx, cy, width);
};

const main = () => {
  document.getElementById("draw-button").onclick = () => {
    update();
  }
  update();
};

main();
