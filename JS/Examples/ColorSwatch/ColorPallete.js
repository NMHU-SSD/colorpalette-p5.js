/** 
 * Written by Michael Zagar and Jonathan Lee.
 * Started in June 2022
 * Last Updated July 29 2022
 * 
 * Class based on Rob Camick's HSL Color library for Java
 * Retrieved on August 20th, 2020
 * https://tips4java.wordpress.com/2009/07/05/hsl-color/
 *
 * No license specified, but https://tips4java.wordpress.com/about/
 *  claims code is freely distributable and modifable.
 *
 * Functions directly translated: HSLtoRGB, HueToRGB, RGBtoHSL
*/

var ColorPalette = function () {
  this._baseColor = null;
  this._complementColor = -1;
  this._monochromes = [-1, -1];
  this._analogues = [-1, -1];
  this.mode = 0;
  this._RYBIndex = 0;
  this._RYBColors = [];

  this._whiteThresh = 1; //any lightness less than this is white
  this._blackThresh = 99; // any lightness greater than this is black
  this._grayThresh = 1; // any saturation less than this is gray

  /**
   * Fills the Global array _RYBColors with colors arranged in RYB, by using the helper function colorInterp. 
   * 
   * Color Values and formula from this paper: 
   * http://vis.computer.org/vis2004/DVD/infovis/papers/gossett.pdf
   */
  this.generateColors = function () {
    let WHITE = color(255, 255, 255);
    let RED = color(255, 0, 0);
    let ORANGE = color(255, 128, 0);
    let YELLOW = color(255, 255, 0);
    let PURPLE = color(127, 0, 127);
    let GREEN = color(0, 169, 51);
    let BLUE = color(42, 95, 153);
    let BLACK = color(51, 24, 0);

    this._RYBColors[0] = YELLOW; // 0 - 360
    this._RYBColors[59] = ORANGE; // 60
    this._RYBColors[119] = RED; // 120
    this._RYBColors[179] = PURPLE; // 180
    this._RYBColors[239] = BLUE; // 240
    this._RYBColors[299] = GREEN; // 300

    let shift = 60;
    let lastValue = 0;
    for (let i = 0; i < 300; i += shift) {
      this.colorInterp(
        this._RYBColors,
        this._RYBColors[lastValue],
        this._RYBColors[i + shift - 1],
        i,
        i + shift
      );
      lastValue = i + shift - 1;
    }
    // has colorInterp to double back on itself, to finish the wheel
    this.colorInterp(
      this._RYBColors,
      this._RYBColors[lastValue],
      this._RYBColors[0],
      lastValue,
      lastValue + 60
    );
  };

  /**
  *  Given an array, this interpolate the mixture between two colors in RYB.
  * Color Values and formula from this paper: 
  * http://vis.computer.org/vis2004/DVD/infovis/papers/gossett.pdf
  */
  this.colorInterp = function (
    colorArray,
    color0,
    color1,
    startingIndex,
    endingIndex
  ) {
    let movement = startingIndex + 1;
    color0 = color0._array;
    color1 = color1._array;

    let distance, r, g, b;
    for (let i = 0; i < abs(endingIndex - startingIndex); i++) {
      distance = map(movement, startingIndex, endingIndex, 0, 1);
      r =
        color0[0] + sq(distance) * (3 - 2 * distance) * (color1[0] - color0[0]);
      g =
        color0[1] + sq(distance) * (3 - 2 * distance) * (color1[1] - color0[1]);
      b =
        color0[2] + sq(distance) * (3 - 2 * distance) * (color1[2] - color0[2]);

      colorArray[movement] = color([r * 255, g * 255, b * 255]);
      movement++;
    }
  };

  if (arguments.length >= 1) {
    this._baseColor = arguments[0];
  } else {
    this.generateColors();
    this.setColorMode("RGB");
    this._RYBIndex = parseInt(random(0, this._RYBColors.length));
    this._baseColor = this._RYBColors[this._RYBIndex];
  }
};

/**
 * Sets a global flag, allowing the user to change the colormode from RGB to RYB when they please.  
 * @mode RYB or RGB
 * @function
 */
ColorPalette.prototype.setColorMode = function (mode) {
  this._complementColor = -1;
  this._monochromes = [-1, -1];
  this._analogues = [-1, -1];
  if (mode === "RGB") {
    this.mode = 0;
  } else if (mode === "RYB") {
    this.mode = 1;
  } else {
    this.mode = 0;
  }
};

/**
* Returns the baseColor in HSL format.
*/
ColorPalette.prototype.getHSLBase = function () {
  return this.RGBtoHSL(_baseColor);
};

/**
* Returns the baseColor;
*/
ColorPalette.prototype.getBaseColor = function () {
  return this._baseColor;
};

/**
* Returns the complement to the baseColor;
*/
ColorPalette.prototype.getComplement = function () {
  if (this._complementColor == -1) {
    this._complementColor = this.findComplement(this._baseColor);
  }
  return this._complementColor;
};

/**
* Returns an array of monochromes of the baseColor;
*/
ColorPalette.prototype.getMonochromes = function () {
  //2 _monochromes assumed
  if (this._monochromes[0] == -1) {
    this._monochromes[0] = this.getShade(this._baseColor, 25);
    this._monochromes[1] = this.getShade(this._baseColor, 50);
  }
  return this._monochromes;
};

/**
* Returns an array of analogues of the baseColor;
*/
ColorPalette.prototype.getAnalogues = function (angle = 30, amount = 5) {
  //2 _analogues assumed
  //print(this._complementColor);
  if (this._analogues[0] == -1) {
    this._analogues[0] = this.getTint(
      this.rotateHue(this._baseColor, -angle),
      -amount
    );
    this._analogues[1] = this.getTint(
      this.rotateHue(this._baseColor, angle),
      amount
    );
  }
  return this._analogues;

};

/**
* Finds the complement of a given color.
* Differentiates if the color is supposed to be returned in RGB or RYB. 
*/
ColorPalette.prototype.findComplement = function (rgbColor) {
  if (this.mode == 0) {
    let hslC = RGBtoHSL(rgbColor);
    if (hslC[2] < this._whiteThresh || hslC[2] > this._blackThresh) {
      //if black or white
      //swap black and white
      return color(abs(red(rgbColor) - 255));
    } else if (hslC[1] < this._grayThresh) {
      //if gray
      //take the red channel and use it as a gray
      // map 0-255 to be 0-360 so the math is the same
      let mappedG = map(red(rgbColor), 0, 256, 0, 360);
      mappedG = (mappedG + 180) % 360;
      //turn the rotated number back into a number between 0-255 for rgb gray
      return color(map(mappedG, 0, 360, 0, 256));
    } else {
      //presumed to be dealing with a color
      hslC[0] = (hslC[0] + 180) % 360;
      return HSLtoRGB(hslC);
    }
  } else if (this.mode == 1) {
    // Just get the other side of the array of RYB
    return this._RYBColors[(this._RYBIndex + 180) % this._RYBColors.length];
  }
};

/**
* Changes alpha of an rgb color and return new color.
*/
ColorPalette.prototype.transparent = function (rgbColor, newAlpha) {
  //make sure alpha is between 0-255
  newAlpha = max(0, newAlpha % 255);
  //must retrieve each channel and replace alpha
  return color(red(rgbColor), green(rgbColor), blue(rgbColor), newAlpha);
};

/**
* Calculates the shade of a given color. 
* If no color is provided, it will use the global baseColor.
* If no shift is provided, it will shift by 60.
*/
ColorPalette.prototype.getShade = function (rgbColor = this._baseColor, shift = 60) {
  hslC = RGBtoHSL(rgbColor);
  //if white, black, or gray
  if (
    hslC[2] < this._whiteThresh ||
    hslC[2] > this._blackThresh ||
    hslC[1] < this._grayThresh
  ) {
    //take the red channel and use it as a gray
    // map 0-255 to be 0-360 so the math is the same
    mappedG = map(red(rgbColor), 0, 255, 0, 360);
    mappedG = abs(mappedG + shift) % 360;
    //turn the rotated number back into a number between 0-255 for rgb gray
    return color(map(mappedG, 0, 360, 0, 255));
  } else {
    hslC[1] = abs(hslC[1] + shift) % 100;
    return HSLtoRGB(hslC);
  }
};

/**
* Calculates the tint of a given color. 
* If no color is provided, it will use the global baseColor.
* If no shift is provided, it will shift by 60.
*/
ColorPalette.prototype.getTint = function (rgbColor = this._baseColor, shift = 60) {
  let hslC = RGBtoHSL(rgbColor);
  hslC[2] = abs(hslC[2] + shift) % 100;
  return HSLtoRGB(hslC);
};

/**
* Rotates the hue for to get the Tint of a color.
*/
ColorPalette.prototype.rotateHue = function (rgbColor, angle) {
  let hslC = RGBtoHSL(rgbColor);
  //if black, white, or gray
  if (
    hslC[2] < this._whiteThresh ||
    hslC[2] > this._blackThresh ||
    hslC[1] < this._grayThresh
  ) {
    //if gray
    //take the red channel and use it as a gray
    // map 0-255 to be 0-360 so the math is the same
    let mappedG = map(red(rgbColor), 0, 255, 0, 360);
    mappedG = max(0, mappedG + angle) % 360;
    //turn the rotated number back into a number between 0-255 for rgb gray
    return color(map(mappedG, 0, 360, 0, 255));
  } else {
    //presumed to be dealing with a color
    hslC[0] = max(0, hslC[0] + angle) % 360;
    return HSLtoRGB(hslC);
  }
};

/**
* Calculates a random hue.
*/
ColorPalette.prototype.randomHue = function () {
  return color(
    parseInt(random(0, 255)),
    parseInt(random(0, 255)),
    parseInt(random(0, 255))
  );
};

/**
* Coverts HSL to RGB with a given HSL value.
* Further Documentation: https://tips4java.wordpress.com/about/
*/
function HSLtoRGB(hsl) {
  let h = hsl[0];
  let s = hsl[1];
  let l = hsl[2];
  let alpha = 1.0;

  if (s < 0.0 || s > 100.0) {
    let message = "Color parameter outside of expected range - Saturation";
    print(message);
  }

  if (l < 0.0 || l > 100.0) {
    let message = "Color parameter outside of expected range - Luminance";
    print(message);
  }

  if (alpha < 0.0 || alpha > 1.0) {
    let message = "Color parameter outside of expected range - Alpha";
    print(message);
  }

  //  Formula needs all values between 0 - 1.

  h = h % 360.0;
  h /= 360;
  s /= 100;
  l /= 100;

  let q = 0;

  if (l < 0.5) q = l * (1 + s);
  else q = l + s - s * l;

  let p = 2 * l - q;

  let r = Math.max(0, HueToRGB(p, q, h + 1.0 / 3.0));
  let g = Math.max(0, HueToRGB(p, q, h));
  let b = Math.max(0, HueToRGB(p, q, h - 1.0 / 3.0));

  r = Math.min(r, 1.0);
  g = Math.min(g, 1.0);
  b = Math.min(b, 1.0);

  r *= 255;
  g *= 255;
  b *= 255;
  alpha *= 255;

  return color(r, g, b, alpha);
}

/**
* Coverts HSL to RGB with a given HSL value.
* Further Documentation: https://tips4java.wordpress.com/about/
*/
function HueToRGB(p, q, h) {
  if (h < 0) h += 1;

  if (h > 1) h -= 1;

  if (6 * h < 1) {
    return p + (q - p) * 6 * h;
  }

  if (2 * h < 1) {
    return q;
  }

  if (3 * h < 2) {
    return p + (q - p) * 6 * (2.0 / 3.0 - h);
  }

  return p;
}

function RGBtoHSL(col) {
  let r = red(col) / 255;
  let g = green(col) / 255;
  let b = blue(col) / 255;

  let min = Math.min(r, Math.min(g, b));
  let max = Math.max(r, Math.max(g, b));

  //  Calculate the Hue

  let h = 0;

  if (max == min) h = 0;
  else if (max == r) h = ((60 * (g - b)) / (max - min) + 360) % 360;
  else if (max == g) h = (60 * (b - r)) / (max - min) + 120;
  else if (max == b) h = (60 * (r - g)) / (max - min) + 240;

  //  Calculate the Luminance

  let l = (max + min) / 2;

  //  Calculate the Saturation

  let s = 0;

  if (max == min) s = 0;
  else if (l <= 0.5) s = (max - min) / (max + min);
  else s = (max - min) / (2 - max - min);

  return [h, s * 100, l * 100];
}
