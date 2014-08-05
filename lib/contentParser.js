

function parseText(text, callback){
	removeScriptTags(text, function(err, results){
		callback(err, results);
	});
}

function removeScriptTags(text, callback){
	text.replace(/<script[^>]*>/gi, ' <!-- ');
	text.replace(/<script[^>]*>/gi, ' <!-- ');
	callback(null, text);
}

exports.parseText = parseText;