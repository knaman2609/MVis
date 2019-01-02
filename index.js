var BAR_PAD = 5;
var BAR_WIDTH = 10;
var MAX_BARS = 50;
var MAX_BG_SCALE = 20;
var SMOOTHING_SAMPLES = 10;

var sfbutton = document.getElementById("sfl");
var bg = document.getElementById("bg");
var player = document.getElementById("player");
var fileTag = document.getElementById("music");
var canvas = document.getElementById("music_display");
var ctx = canvas.getContext("2d");
var audioCtx, analyser, source;

setTimeout(function() { player.classList.remove("player_shown"); }, 2500);

var hot_edge = document.getElementById("hot_edge");
hot_edge.onmouseenter = function() {
  player.classList.add("player_shown");
};

hot_edge.onmouseleave = function() {
  player.classList.remove("player_shown");
};

canvas.width = window.innerWidth * 0.5;
canvas.height = window.innerHeight * 0.4;

window.onresize = function() {
  canvas.width = window.innerWidth * 0.5;
  canvas.height = window.innerHeight * 0.4;
}

function draw_bars(values) {
  var len = values.length - (~~(values.length / MAX_BARS)*4);
  var normFac = 255;
  var maxValue = normFac;
  var istep = ~~(len / MAX_BARS);
  var step = canvas.width / MAX_BARS;
  var x = BAR_WIDTH;
  var height = (canvas.height - (BAR_PAD * 2));

  for (var i = 0; i < len; i+=istep) {
    var v = (values[i] / maxValue);
    var h = v * height;
    var y = height / 2 - h / 2;
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 255, 255, 1)";
    ctx.lineWidth = BAR_WIDTH;
    ctx.lineCap = 'round';
    ctx.moveTo(x, y);
    ctx.lineTo(x, y+h);
    ctx.stroke();
    x += step;
  }

  // Background size change with bass
  var fac = 0.0;
  var div = 0;
  for (var i = 0; i < len-SMOOTHING_SAMPLES; i++) {
    var avgN = 0.0;
    for (var j = 0; j < SMOOTHING_SAMPLES; j++) {
      avgN += Math.abs(values[i+j] / maxValue * 2.0);
    }
    avgN /= SMOOTHING_SAMPLES;

    fac += avgN;
    div++;
  }
  fac /= div;
  fac *= MAX_BG_SCALE;

  var szW = ~~(150+fac);
  var szH = ~~(100+fac);
  var sz = szW.toString()+"% "+szH.toString()+"%";
  bg.style.backgroundSize=sz;
}

function mainloop() {
  var fbc = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(fbc);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw_bars(fbc);

  requestAnimationFrame(mainloop);
}

document.querySelector("body").addEventListener("mouseover", function() {
  if (window.playing) {
    return;
  }

  window.playing = true;

  player.load();
  audioCtx = new AudioContext();
  analyser = audioCtx.createAnalyser();
  source = audioCtx.createMediaElementSource(player);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  player.play();
  mainloop();
});
