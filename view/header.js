var config = require('../config'),
	contents = function(){	
		return [
			'<!DOCTYPE html>',
			'<html lang="en">',
			'<head>',
			'<meta charset="utf-8">',
			'<meta http-equiv="X-UA-Compatible" content="IE=edge">',
			'<meta name="viewport" content="width=device-width, initial-scale=1">',
		    '<title>' + config.app.title + '</title>',
			'<meta name="description" content="' + config.app.description + '">',
		    '<link rel="stylesheet" href="/' + config.app.static.style + 'screen.' + config.app.static.build + '.min.css" type="text/css"/>',
		    //'<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">',
		    '</head>',
			'<body>',
		    '<div class="header">',
			'<a href="/" title="' + config.app.description + '" class="logo"><h1>' + config.app.title + '</h1></a>',
			'</div>',
			'<div id="app">'
		];
}
module.exports.contents = contents;