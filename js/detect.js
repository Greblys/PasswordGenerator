function isRegistrationPage(){
	return $('input[type="password"]').length > 0;
}

var suggestionBox = $('\
	<div id="passwordGeneratorSuggestion">\
		<img src="' + chrome.extension.getURL("images/lock-16.png") + '" />\
		<div>You should use longer password</div>\
	</div>\
');

$(document).ready(function(){
	if(isRegistrationPage()) 
		$('input[type="password"]').keyup(function() {
			$(suggestionBox).remove();
			if($(this).val().length < 8) {
				$(this).after(suggestionBox);
			}
		});
});
