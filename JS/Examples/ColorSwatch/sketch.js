var cp = null;

function setup() {
  createCanvas(300, 300);
  frameRate(2);
  smooth();
  cp = new ColorPalette();
  cp.setColorMode("RGB")
  swatchColor(cp);
}

function draw() {

}

function swatchColor(cp) {
 noStroke();
 //The base color should be 1/3 the height of the screen and stretch across the top.
 fill(cp.getComplement());
 rect(0,0,width,height/3);
 
 //the Analogues should each be 1/3 the height of the screen 
 // and be 1/4 the width in the lower left.
 fill(cp.getAnalogues()[0]);
 rect(0,height/3,width/4,height/3);

 //fill(255,255,255);
 fill(cp.getAnalogues()[1]);
 rect(0,height/1.5,width/4,height/3);
 
 //The compliment should be 2/3 the height of the screen 
 // and be directly in the middle, taking up 1/2 the width.
  fill(cp.getBaseColor());
  rect(width/4,height/3,width/2,height/1.5);
  
 //The monochromes should each be 1/3 the height of the screen 
 //and be 14 the width in the lower right corner.
 fill(cp.getMonochromes()[0]);
 rect(width*.75,height/3,width/4,height/3);
 //fill(255,255,255);
 fill(cp.getMonochromes()[1]);
 rect(width*.75,height/1.5,width/4,height/3);
}

function keyPressed(event) {
  
  if(event.key == 'r') {
    cp.setColorMode("RGB");
    swatchColor(cp);
    
  } else if (event.key == 'y') {
    cp.setColorMode("RYB");
    swatchColor(cp);
  }
}