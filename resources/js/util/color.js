import _ from 'lodash';

const multipliers = [
  (16 * 213) / 255,
  213 / 255,
  (16 * 715) / 255,
  715 / 255,
  (16 * 72) / 255,
  72 / 255,
];

export const fgFromBg = (bgHex) => {
  const digits = bgHex.split('').map((x) => parseInt(x, 16));
  const value = _.sum(_.zipWith(digits, multipliers, (a, b) => a * b));
  return value < 500 ? 'FFFFFF' : '000000';
};

export const hslToRgb = (h, s, l) => {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255),
  ];
};

export const arrayToRgb = (colors) => {
  return (colors[0] * 256 * 256 + colors[1] * 256 + colors[2]).toString(16).padStart(6, '0');
};

const rgbToArray = (color) => {
  let c = color;
  if (c[0] === '#') {
    c = color.substr(1);
  }
  return [
    parseInt(c.substr(0, 2), 16),
    parseInt(c.substr(2, 2), 16),
    parseInt(c.substr(4, 2), 16),
  ];
};

export const rgbToHsl = (color) => {
  const r = parseInt(color.substr(0, 2), 16)/255;
  const g = parseInt(color.substr(2, 2), 16)/255;
  const b = parseInt(color.substr(4, 2), 16)/255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if(max == min){
    return [h, s, l];
  }
  const d = max - min;
  s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
  }
  h /= 6;

  return [h, s, l];
};

function deltaE(rgbA, rgbB) {
  let labA = rgb2lab(rgbA);
  let labB = rgb2lab(rgbB);
  let deltaL = labA[0] - labB[0];
  let deltaA = labA[1] - labB[1];
  let deltaB = labA[2] - labB[2];
  let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  let deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  let sc = 1.0 + 0.045 * c1;
  let sh = 1.0 + 0.015 * c1;
  let deltaLKlsl = deltaL / (1.0);
  let deltaCkcsc = deltaC / (sc);
  let deltaHkhsh = deltaH / (sh);
  let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

function rgb2lab(rgb){
  let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

export const randomColor = (userCourses, newCourse) => {
  const subject = newCourse.coursecode.match(/[A-Z]+/)[0];
  const sameSubjectColors = userCourses.filter(
    uc => uc.course.coursecode.match(/[A-Z]+/)[0] === subject)
    .map(uc => uc.color); // also sort by coursecode
  if (sameSubjectColors.length === 0) {
    let randomInterval = [0, 1];
    const hues = userCourses.map(uc => rgbToHsl(uc.color)[0]).sort();
    if (hues.length > 0) {
      hues.push(hues[0] + 1);
      let widestInterval = [hues[0], hues[1]];
      for (let i = 1; i + 1 < hues.length; i++) {
        if (hues[i + 1] - hues[i] > widestInterval[1] - widestInterval[0]) {
          widestInterval = [hues[i], hues[i + 1]];
        }
      }
      const width = widestInterval[1] - widestInterval[0];
      randomInterval = [widestInterval[0] + (width * 0.2), widestInterval[1] - (width * 0.2)];
    }
    let randomHue = Math.random() * (randomInterval[1] - randomInterval[0]) + randomInterval[0];
    if (randomHue >= 1) {
      randomHue = randomHue - 1;
    }
    const s = Math.random() * 0.6 + 0.3;
    const l = Math.random() * 0.6 + 0.3;
    return arrayToRgb(hslToRgb(randomHue, s, l));
  }
  const num = sameSubjectColors.length; // for calibrating random color
  const existingL = rgbToHsl(sameSubjectColors[0])[2];
  const ss = userCourses.map(uc => rgbToHsl(uc.color)[1]).sort();
  const ls = userCourses.map(uc => rgbToHsl(uc.color)[2]).sort();
  const sRange = [Math.max(0.1, Math.min(...ss) - 0.1), Math.min(0.9, Math.max(...ss) + 0.1)];
  const lRange = [Math.max(0.1, Math.min(...ls) - 0.1), Math.min(0.9, Math.max(...ls) + 0.1)];
  for (let i = 0; i < 300; i++) {
    const h = rgbToHsl(sameSubjectColors[0])[0] + Math.random() * (num * 0.02 + 0.04);
    const s = Math.random() * (sRange[1] - sRange[0]) + sRange[0];
    const l = Math.random() * (lRange[1] - lRange[0]) + lRange[0];
    const rgb = hslToRgb(h, s, l);
    const ok = true;
    // https://stackoverflow.com/questions/13586999/color-difference-similarity-between-two-values-with-js
    const failed = _.find(sameSubjectColors, c => {
      const difference = deltaE(rgbToArray(c), rgb);
      return !_.inRange(difference, 12 - 4 * existingL - num * 0.2, 15 + num * 5);
    });
    if (!failed) {
      return arrayToRgb(rgb);
    }
  }
  return Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
};
