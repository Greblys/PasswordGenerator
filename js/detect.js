var suggestionBox = $('\
	<div id="passwordGeneratorSuggestion">\
		<img src="' + chrome.extension.getURL("images/lock-16.png") + '" />\
		<div>You should use longer password</div>\
	</div>\
  <canvas id="imageReminder" width="557" height="195" ></canvas>\
');

var keyboard = new Array();
var COORD_STEP = 36;
var Y_START = 26;
var WIDTH = 25;

keyboard[0] = {x_start: 26, keys: [['`', '¬'], ['1', '!'], ['2', '"'], ['3', '£'], ['4', '$'], ['5', '%'], ['6', '^'], ['7', '&'], ['8', '*'], ['9', '('],  ['0', ')'], ['-', '_'], ['=', '+']]}
keyboard[1] = {x_start: 42, keys: [undefined, 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i',       'o',         'p',        ['[', '{'], [']', '}']]}
keyboard[2] = {x_start: 54, keys: [undefined, 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k',       'l',         [';', ':'], ["'", '@'], ['#', '~']]}
keyboard[3] = {x_start: 74, keys: [['\\', '|'], 'z', 'x', 'c', 'v', 'b', 'n', 'm', [',', '<'], ['.', '>'], ['/', '?'], undefined,  undefined]}

function isRegistrationPage(){
  return $('input[type="password"]').length > 0;
}

function randomItem(array){
  var i = Math.floor(Math.random() * array.length);
  return {index: i, item: array[i]};
}

function generateBlizzard(){
  var row = 1;
  var col = 0;
  var sugg = "";
  var line = [];
  
  while (keyboard[row].keys[col] === undefined) {
    row = randomItem(keyboard).index;
    col = randomItem(keyboard[row].keys).index;
  }
  
  while(sugg.length < 8){
    //animation
    line.push({ x: col*COORD_STEP + keyboard[row].x_start, y: row*COORD_STEP+Y_START})
    var m = Math.round(Math.random());
    if($.isArray(keyboard[row].keys[col])) 
      sugg += keyboard[row].keys[col][m];
    else
      if(m == 0)
        sugg += keyboard[row].keys[col];
      else
        sugg += keyboard[row].keys[col].toUpperCase();
    
    var next = { row: -1, col: -1 };
    while( keyboard[next.row] === undefined
           || keyboard[next.row].keys[next.col] === undefined) {
      
      neighbours = [
        /*{ row: row-1, col: col-1 },*/   { row: row-1, col: col },   { row: row-1, col: col+1 },
          { row: row,   col: col-1 },                                 { row: row,   col: col+1 },
          { row: row+1, col: col-1 },     { row: row+1, col: col }/*, { row: row+1, col: col+1 }*/
      ];
      next = randomItem(neighbours).item
    }
    row = next.row;
    col = next.col; 
  }
  return {line: line, sugg: sugg };
}

$(document).ready(function(){
  $('input[type="password"]').first().after(suggestionBox);
  var psw = generateBlizzard();
  console.log(psw.sugg);
  var canvas = document.getElementById("imageReminder");
  var ctx = canvas.getContext("2d");
  ctx.globalAlpha=0.2;
  /*
  for (var i=0; i < psw.line.length; i++) {
    ctx.lineTo(psw.line[i].x, psw.line[i].y);
    ctx.moveTo(psw.line[i].x, psw.line[i].y);
  }*/
  var i = 0;
  setInterval(function() {
    ctx.lineTo(psw.line[i].x, psw.line[i].y);
    ctx.moveTo(psw.line[i].x, psw.line[i].y);
    ctx.fillStyle="#FF0000";
    ctx.fillRect(psw.line[i].x - WIDTH/2.0, psw.line[i].y - WIDTH/2.0, WIDTH, WIDTH);
    ctx.stroke();
    if (i < psw.line.length - 1) 
      i++;
    else {
      i = 0;
      ctx.beginPath();
      ctx.clearRect(0,0, 9999, 9999);
    }
  }, 2000);
  //ctx.stroke();
	if(isRegistrationPage()) 
		$('input[type="password"]').keyup(function() {
			$(suggestionBox).remove();
			if($(this).val().length < 8) {
				$(this).after(suggestionBox);
        $("#imageReminder").mousemove(function( ev ){
          console.log(ev.offsetX + ' ' + ev.offsetY);
        });
			}
		});
});
