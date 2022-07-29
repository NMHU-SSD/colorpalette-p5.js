//https://redyellowblue.org/wp-content/uploads/2017/07/ryb-color-wheel.png?ad37ed&ad37ed
/* 
  Assemble the wheel with 60 degrees per magic color
*/

//globals

var WHITE = null;
var RED = null;
var ORANGE = null;
var YELLOW = null;
var PURPLE = null;
var GREEN = null;
var BLUE = null;
var BLACK = null;
var SATS = 0;
var BRIS = 0;
var SELECTEDCOLOR = null;
var COLORS_ARRAY = null;
var LOCKED = true;
var HUEV = 0;
var SATV = 0;
var BRIV = 0;

var LASTUSED = 0;

function setup() {
  createCanvas(500, 500);
  COLORS_ARRAY = new Array(360);
  SATS = new Array(height);
  BRIS = new Array(height);
  SELECTEDCOLOR = color(255, 0, 0);
  //noLoop();
  noStroke();
  //color values from
  //http://vis.computer.org/vis2004/DVD/infovis/papers/gossett.pdf
  WHITE = color(255, 255, 255);
  RED = color(255, 0, 0);
  ORANGE = color(255, 128, 0);
  YELLOW = color(255, 255, 0);
  PURPLE = color(127, 0, 127);
  GREEN = color(0, 169, 51);
  BLUE = color(42, 95, 153);
  BLACK = color(51, 24, 0);

  COLORS_ARRAY[0] = YELLOW; // 0 - 360
  COLORS_ARRAY[59] = ORANGE; // 60
  COLORS_ARRAY[119] = RED; // 120
  COLORS_ARRAY[179] = PURPLE; // 180
  COLORS_ARRAY[239] = BLUE; // 240
  COLORS_ARRAY[299] = GREEN; // 300

  SATS[0] = WHITE;
  SATS[SATS.length - 1] = SELECTEDCOLOR;
  BRIS[0] = BLACK;
  BRIS[BRIS.length - 1] = SELECTEDCOLOR;
  SATV = SATS.length - 1;
  BRIV = BRIS.length - 1;
  
  let shift = 60;
  let lastValue = 0;
  generateColors(COLORS_ARRAY);
  colorInterp(SATS, color(255), SELECTEDCOLOR, 0, SATS.length);
  colorInterp(BRIS, color(0), SELECTEDCOLOR, 0, BRIS.length);
}

function draw() {
  background(SELECTEDCOLOR);

  let cx = width / 2;
  let cy = height / 2;
  let d = 500;
  let w = 25;

  testMouse(cx, cy, d, w);

  drawWheel(width / 2, height / 2, 500);
  drawSat(w);
  drawBri(w);
}

function drawWheel(cx, cy, r) {
  noStroke();
  let numColors = 360;
  let step = 1;
  for (let ang = 0; ang < 360; ang += step) {
    fill(COLORS_ARRAY[ang]);
    arc(
      cx,
      cy,
      r / 2,
      r / 2,
      radians(ang + 270),
      radians(ang + 270 + step * 2)
    );
  }
}

function drawSat(w) {
  let step = height / 100;
  for (let y = 0; y < height; y++) {
    fill(SATS[y]);
    rect(0, y, 25, step);
  }
}

function drawBri(w) {
  let step = height / 100;
  for (let y = 0; y < height; y++) {
    fill(BRIS[y]);
    rect(width - w, y, 25, step);
  }
}

function generateColors(array) {
  let shift = 60;
  let lastValue = 0;
  for (let i = 0; i < 300; i += shift) {
    colorInterp(array, array[lastValue], array[i + shift - 1], i, i + shift);
    lastValue = i + shift - 1;
  }
  // has colorInterp to double back on itself, to finish the wheel
  colorInterp(array, array[lastValue], array[0], lastValue, lastValue + 60);
}
/* 
   
   interpolates all the color mixes between two colors 
     that are 60 degrees apart from each other.
  
   Using the formula from the paper below,
   http://vis.computer.org/vis2004/DVD/infovis/papers/gossett.pdf
*/

function colorInterp(colorArray, color0, color1, startingIndex, endingIndex) {
  let movement = startingIndex + 1;
  color0 = color0._array;
  color1 = color1._array;

  let distance, r, g, b;
  for (let i = 0; i < abs(endingIndex - startingIndex); i++) {
    distance = map(movement, startingIndex, endingIndex, 0, 1);
    r = color0[0] + sq(distance) * (3 - 2 * distance) * (color1[0] - color0[0]);
    g = color0[1] + sq(distance) * (3 - 2 * distance) * (color1[1] - color0[1]);
    b = color0[2] + sq(distance) * (3 - 2 * distance) * (color1[2] - color0[2]);

    colorArray[movement] = color([r * 255, g * 255, b * 255]);
    movement++;
  }
}

function testMouse(cx, cy, r, w) {
  if (
    mouseX > cx - r / 4 &&
    mouseX < cx + r / 4 &&
    mouseY > cy - r / 4 &&
    mouseY < cy + r / 4 &&
    !LOCKED
  ) {
    mouseHue();
  } else if (mouseX < w && !LOCKED) {
    mouseSat();
  } else if (mouseX > width - w && !LOCKED) {
    mouseBri();
  }
}
function mouseClicked() {
  LOCKED = !LOCKED;
}

function mouseSat() {
  SATV = floor(map(mouseY, 0, SATS.length - 1, 0, height - 1));
  if (SATV >= SATS.length) SATV = SATS.length - 1;
  colorInterp(BRIS, color(0), SATS[SATV], -1, height);
  SELECTEDCOLOR = SATS[SATV];
  LASTUSED = 0;
}

function mouseBri() {
  BRIV = floor(map(mouseY, 0, BRIS.length - 1, 0, height - 1));
  if (BRIV >= BRIS.length) BRIV = BRIS.length - 1;
  colorInterp(SATS, color(0), BRIS[BRIV], -1, height);
  SELECTEDCOLOR = BRIS[BRIV];
  LASTUSED = 1;
}

function refreshArrays() {
  SATS = new Array(height);
  BRIS = new Array(height);
  SATS[0] = WHITE;
  SATS[SATS.length - 1] = SELECTEDCOLOR;
  BRIS[0] = BLACK;
  BRIS[BRIS.length - 1] = SELECTEDCOLOR;
  

  colorInterp(SATS, color(255), SELECTEDCOLOR, 0, SATS.length);
  colorInterp(BRIS, color(0), SELECTEDCOLOR, 0, BRIS.length);
  
  if (LASTUSED == 0) SELECTEDCOLOR = SATS[SATV];
  else SELECTEDCOLOR = BRIS[BRIV];
}
function mouseHue() {
  let mx = map(mouseX, 0, width, -PI, PI);
  let my = map(mouseY, 0, height, -PI, PI);

  let rads = atan2(my, mx);
  if (rads < 0) {
    rads = TWO_PI + rads;
  }

  let ang = degrees(rads);
  if (ang > 270) {
    ang = abs(270 - ang);
  } else {
    ang += 90;
  }
  HUEV = floor(ang);

  let col = color(`hsba(${HUEV}, ${SATV}, ${BRIV}, 1)`);

  SELECTEDCOLOR = COLORS_ARRAY[HUEV % 360];
  refreshArrays();
}
