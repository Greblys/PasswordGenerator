
var BASE_URL = "https://www.greblikas.me/";
var keyboard = new Array();
var COORD_STEP = 36;
var Y_START = 26;
var WIDTH = 25;
var submittedDuration = false;

keyboard[0] = {x_start: 26, keys: [undefined, ['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9'],  ['0'], ['-'], ['=']]}
keyboard[1] = {x_start: 42, keys: [undefined, 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i',       'o',         'p',        ['['], [']']]}
keyboard[2] = {x_start: 54, keys: [undefined, 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k',       'l',         [';'], ["'"], ['#']]}
keyboard[3] = {x_start: 74, keys: [undefined, 'z', 'x', 'c', 'v', 'b', 'n', 'm', [','], ['.'], ['/'], undefined,  undefined]}

var suggestionBox = $('\
	<div id="passwordGeneratorSuggestion">\
		<img id="psg-logo" src="' + chrome.extension.getURL("images/lock-16.png") + '" />\
		<a id="psg-close" href="javascript:;">\
	    <img src="'+chrome.extension.getURL("images/close.png")+'" />\
	  </a>\
		<div> \
		  Your password is weak. You should add a digit, symbol,\
		  lowercase/uppercase letter or make it longer.  Would you like me to \
		  suggest \
		  <a id="suggestMemorable">decent and memorable</a> \
		  or \
		  <a id="suggestStrong">very strong</a> \
		  password for you?\
	  </div>\
	</div>\
');
var useSuggestion;
var jQueryCanvas;

var currentPassStrength = 0;
var generatedType = "custom";

function isRegistrationPage(){
	return $('input[type="password"]').length > 0;
}

function randomItem(array){
	var i = Math.floor(Math.random() * array.length);
	return {index: i, item: array[i]};
}

function suggestMemorablePassword(field){
	suggestionBox.remove();
	generateBlizzard(field);
}

function suggestStrongPassword(field){
  suggestionBox.remove();
  if(jQueryCanvas) jQueryCanvas.remove();
  var chars = "QWERTYUIOPASDFGHJKLZXCVBNqwertyuiopasdfghjklzxcvbnm1234567890¬`|\\!\"£$%^&*()_-+=[]{};'#,./:@~<>?";
  var randomInts = [];
  var suggestion = "";
  var length = 12;
  //true randomness 
  $.get("https://www.random.org/integers/?num="+length+"&min=0&max="+(chars.length-1)+"&col="+length+"&base=10&format=plain&rnd=new", 
         function(data){
            randomInts = data.split("\t");
            for (var i = 0; i < length; i++) {
              suggestion += chars[parseInt(randomInts[i])];
            }
            useSuggestion = $('<div id="passwordGeneratorSuggestion"><a>Use suggested password</a><h3>'+suggestion+'<h3></div>');
	          $("#passwordGeneratorSuggestion").remove();
	          $(field).after(useSuggestion);
	          $(useSuggestion).find("a").click(function(){
	            $(field).val(suggestion);
	            generatedType = "secure";
	            removeLastDuration();
	          });
         }
  );
}

function generateBlizzard(field){
  jQueryCanvas = $('<canvas id="imageReminder" width="557" height="195" ></canvas>');
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
	useSuggestion = $('<div id="passwordGeneratorSuggestion"><a>Use suggested password</a><h3>'+sugg+'<h3></div>');
	$("#passwordGeneratorSuggestion").remove();
	$(field).after(useSuggestion);
	$(useSuggestion).find("a").click(function(){
	  $(field).val(sugg);
	  generatedType = "memorable";
	  removeLastDuration();  
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
      $.get(BASE_URL+"?task=getid", function(data){
        chrome.storage.sync.set({"id": data});
        callback(data);
      });
    else
      callback(id["id"]);
  });  
}

function senduration(duration){
  getUserUniqueid(function(id){
    $.get(BASE_URL+"?task=submitDuration&duration="+duration+"&userid="+id, function(response){
      console.log("Response from sending data: " + response);
    });
  });
  submittedDuration = true;
}

function removeLastDuration(){
  if(submittedDuration) {
    getUserUniqueid(function(id){
      $.get(BASE_URL+"?task=removeLastDuration&userid="+id, function(response){
        console.log("Response after removing last duration: " + response);
      });
    });
    submittedDuration = false;
  }
}

function sendPasswordStrength(strength, generatedType){
  getUserUniqueid(function(id){
    $.get(BASE_URL+"?task=submitPassStrength&strength="+strength+"&type="+generatedType+"&userid="+id, function(response){
      console.log("Response after submitting password strength: " + response);
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
      senduration(window.performance.now() - startEnter);
      startEnter = undefined;
    });
    //second one
    $(passwordField).parents("form").submit(function() {
      if(startEnter)
        senduration(window.performance.now() - startEnter);
      sendPasswordStrength(currentPassStrength, generatedType);
    });
    
    $(passwordField).keyup(function() {
      generatedType = "custom";
    });
    
    $(passwordField).pStrength({
      'bind' : 'keyup',
      'onPasswordStrengthChanged' : function(passwordStrength, percentage){
        currentPassStrength = percentage;
        $(suggestionBox).remove();
        if(percentage < 67) {
          $(this).after(suggestionBox); 
          $(suggestionBox).find("#psg-close").click(function(){
            $(suggestionBox).hide();
            $(useSuggestion).hide();
            $(jQueryCanvas).hide();
          });
          suggestionBox.find("#suggestMemorable").click(function(){
            removeLastDuration();
            suggestMemorablePassword(passwordField);
          }); 
          suggestionBox.find("#suggestStrong").click(function(){
            removeLastDuration();
            suggestStrongPassword(passwordField);
          });
        }
      }
    });
  }
});
