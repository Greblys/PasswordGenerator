var suggestionBox = $('\
	<div id="passwordGeneratorSuggestion">\
		<img src="' + chrome.extension.getURL("images/lock-16.png") + '" />\
		<div>You should use longer password</div>\
	</div>\
');

var keyboard = new Array();
keyboard[0] = [['`', '¬'], ['1', '!'], ['2', '"'], ['3', '£'], ['4', '$'], ['5', '%'], ['6', '^'], ['7', '&'], ['8', '*'], ['9', '('],  ['0', ')'], ['-', '_'], ['=', '+']]
keyboard[1] = [undefined,   'q', 'w', 'e', 'r', 't', 'y', 'u', 'i',       'o',         'p',        ['[', '{'], [']', '}']]
keyboard[2] = [undefined,   'a', 's', 'd', 'f', 'g', 'h', 'j', 'k',       'l',         [';', ':'], ["'", '@'], ['#', '~']]
keyboard[3] = [['\\', '|'], 'z', 'x', 'c', 'v', 'b', 'n', 'm', [',', '<'], ['.', '>'], ['/', '?'], undefined,  undefined]

function isRegistrationPage(){
	return $('input[type="password"]').length > 0;
}

function randomItem(array){
  return Math.floor(Math.random() * array.length);
}

function generateBlizzard(){
  var row = 1;
  var col = 0;
  var sugg = "";
  
  while (keyboard[row][col] === undefined) {
    row = randomItem(keyboard);
    col = randomItem(keyboard[row]);
  }
  
  while(sugg.length < 8){
    console.log("iteration");
    console.log(row);
    console.log(col);
    var m = Math.round(Math.random());
    if($.isArray(keyboard[row][col])) 
      sugg += keyboard[row][col][m];
    else
      if(m == 0)
        sugg += keyboard[row][col];
      else
        sugg += keyboard[row][col].toUpperCase();
    
    var next = { row: -1, col: -1 };
    while(next.row < 0 || next.row >= keyboard.length || next.col < 0 || next.col >= keyboard[next.row].length)
      next = randomItem([
        { row: row-1, col: col-1 }, { row: row-1, col: col }, { row: row-1, col: col+1 },
        { row: row,   col: col-1 },                           { row: row,   col: col+1 },
        { row: row+1, col: col-1 }, { row: row+1, col: col }, { row: row+1, col: col+1 }
      ]);
    row = next.row;
    col = next.col;
  }
  return sugg;
}

$(document).ready(function(){
  console.log(generateBlizzard());
	if(isRegistrationPage()) 
		$('input[type="password"]').keyup(function() {
			$(suggestionBox).remove();
			if($(this).val().length < 8) {
				$(this).after(suggestionBox);
			}
		});
});
