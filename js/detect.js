
var keyboard = new Array();
var COORD_STEP = 36;
var Y_START = 26;
var WIDTH = 25;

keyboard[0] = {x_start: 26, keys: [undefined, ['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9'],  ['0'], ['-'], ['=']]}
keyboard[1] = {x_start: 42, keys: [undefined, 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i',       'o',         'p',        ['['], [']']]}
keyboard[2] = {x_start: 54, keys: [undefined, 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k',       'l',         [';'], ["'"], ['#']]}
keyboard[3] = {x_start: 74, keys: [undefined, 'z', 'x', 'c', 'v', 'b', 'n', 'm', [','], ['.'], ['/'], undefined,  undefined]}

var suggestionBox = $('\
	<div id="passwordGeneratorSuggestion">\
		<img src="' + chrome.extension.getURL("images/lock-16.png") + '" />\
		<div>Your password is weak. You should add a digit, symbol, lowercase/uppercase letter or make it longer.  <a id="passGenSuggest">Would you like me to suggest good and strong password for you?</a></div>\
	</div>\
');

function isRegistrationPage(){
	return $('input[type="password"]').length > 0;
}

function randomItem(array){
	var i = Math.floor(Math.random() * array.length);
	return {index: i, item: array[i]};
}

function suggestPassword(field){
	suggestionBox.remove();
	generateBlizzard(field);
}

function generateBlizzard(field){
  var jQueryCanvas = $('<canvas id="imageReminder" width="557" height="195" ></canvas>');
	var row = 1;
	var col = 0;
	var sugg = "";
	var line = [];
	
	$("#imageReminder").remove();
	$(field).after(jQueryCanvas);
	var canvas = document.getElementById("imageReminder");
	var ctx = canvas.getContext("2d");
	ctx.globalAlpha=0.2;
	/*
	for (var i=0; i < psw.line.length; i++) {
		ctx.lineTo(psw.line[i].x, psw.line[i].y);
		ctx.moveTo(psw.line[i].x, psw.line[i].y);
	}*/
	
	while (keyboard[row].keys[col] === undefined) {
		row = randomItem(keyboard).index;
		col = randomItem(keyboard[row].keys).index;
	}
	
	while(sugg.length < 8){
		line.push({ x: col*COORD_STEP + keyboard[row].x_start, y: row*COORD_STEP+Y_START})
		sugg += keyboard[row].keys[col];
		
		var next = { row: -1, col: -1 };
		var count = 0;
		while( keyboard[next.row] === undefined
					 || keyboard[next.row].keys[next.col] === undefined
					 || sugg.indexOf(keyboard[next.row].keys[next.col]) > -1) {
			neighbours = [
				/*{ row: row-1, col: col-1 },*/   { row: row-1, col: col },   { row: row-1, col: col+1 },
					{ row: row,   col: col-1 },                                 { row: row,   col: col+1 },
					{ row: row+1, col: col-1 },     { row: row+1, col: col }/*, { row: row+1, col: col+1 }*/
			];
			next = randomItem(neighbours).item

			if(count > 10) {
			  sugg = "";
			  line = [];
			  row = 1;
			  col = 0;
			  while (keyboard[row].keys[col] === undefined) {
		      row = randomItem(keyboard).index;
		      col = randomItem(keyboard[row].keys).index;
	      }
			}
			count++;
		}
		row = next.row;
		col = next.col; 
	}
	var useSuggestion = $('<div id="passwordGeneratorSuggestion"><a>Use suggested password</a><h3>'+sugg+'<h3></div>');
	$("#passwordGeneratorSuggestion").remove();
	$(field).after(useSuggestion);
	$(useSuggestion).click(function(){
	  $(field).val(sugg);
	});
	//password generated - now animate it
	var i = 0;
	var psw = {line: line, sugg: sugg};
	setInterval(function() {
	  if(i >= psw.line.length) {
			i = 0;
			ctx.beginPath();
			ctx.clearRect(0,0, 9999, 9999);
		}
		ctx.lineTo(psw.line[i].x, psw.line[i].y);
		ctx.moveTo(psw.line[i].x, psw.line[i].y);
		ctx.fillStyle="#FF0000";
		ctx.fillRect(psw.line[i].x - WIDTH/2.0, psw.line[i].y - WIDTH/2.0, WIDTH, WIDTH);
		ctx.stroke();
		if (i < psw.line.length) 
			i++;
	}, 2000);
}

function isWeak(password) {
	return password.length < 8;
}

function getUserUniqueid(callback) {
  chrome.storage.sync.get("id", function(id){
    if($.isEmptyObject(id)) 
      $.get("http://passgenstorage.elasticbeanstalk.com/?task=getid", function(data){
        chrome.storage.sync.set({"id": data});
        callback(data);
      });
    else
      callback(id["id"]);
  });  
}

function senduration(duration){
  getUserUniqueid(function(id){
    $.get("http://passgenstorage.elasticbeanstalk.com/?task=submitDuration&duration="+duration+"&userid="+id, function(response){
      console.log("Response from sending data: " + response);
    });
  });
}

function removeLastDuration(){
  getUserUniqueid(function(id){
    $.get("http://passgenstorage.elasticbeanstalk.com/?task=removeLastDuration&userid="+id, function(response){
      console.log("Response after removing last duration: " + response);
    });
  });
}
	
$(document).ready(function(){
  if(isRegistrationPage()) {
	  var passwordField = $('input[type="password"]');
    
	  /*
	  $(passwordField).keyup(function() {
      $(suggestionBox).remove();
		  if(isWeak($(this).val())) {
			  $(this).after(suggestionBox);
			  suggestionBox.click(function(){
			    removeLastDuration();
			    suggestPassword(passwordField);
			  });
			  /*
			   * Print canvas coordinates in console.
				  $("#imageReminder").mousemove(function( ev ){
					  console.log(ev.offsetX + ' ' + ev.offsetY);
				  });
			     vitality
		  }
	  });
	  */
    var startEnter;
	  $(passwordField).focus(function() {
		  startEnter = window.performance.now();
	  });
	  //two ways out of password field possible
	  //first one
    $(passwordField).focusout(function() {
      console.log(document.activeElement);
      senduration(window.performance.now() - startEnter);
      startEnter = undefined;
    });
    //second one
    $(passwordField).parents("form").submit(function() {
      if(startEnter)
        senduration(window.performance.now() - startEnter);
    });
    //password strength meter
    $(passwordField).pStrength({
      'bind' : 'keyup',
      'onPasswordStrengthChanged' : function(passwordStrength, percentage){
        $(suggestionBox).remove();
        if(percentage < 67) {
          console.log("bad password");
          $(this).after(suggestionBox); 
          suggestionBox.click(function(){
            console.log("click");
            removeLastDuration();
            suggestPassword(passwordField);
          }); 
        }
      }
    });
  }
});
