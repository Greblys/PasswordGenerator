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
  var i = Math.floor(Math.random() * array.length);
  return {index: i, item: array[i]};
}

function generateBlizzard(){
  var row = 1;
  var col = 0;
  var sugg = "";
  
  while (keyboard[row][col] === undefined) {
    row = randomItem(keyboard).index;
    col = randomItem(keyboard[row]).index;
  }
  
  while(sugg.length < 8){
    var m = Math.round(Math.random());
    if($.isArray(keyboard[row][col])) 
      sugg += keyboard[row][col][m];
    else
      if(m == 0)
        sugg += keyboard[row][col];
      else
        sugg += keyboard[row][col].toUpperCase();
    
    var next = { row: -1, col: -1 };
    while(
          keyboard[next.row] === undefined
          || keyboard[next.row][next.col] === undefined) {
      
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
  return sugg;
}

$(document).ready(function(){
  for (var i = 0; i < 100; i++) {
    console.log(generateBlizzard());
  }
	if(isRegistrationPage()) 
		$('input[type="password"]').keyup(function() {
			$(suggestionBox).remove();
			if($(this).val().length < 8) {
				$(this).after(suggestionBox);
			}
		});
});
