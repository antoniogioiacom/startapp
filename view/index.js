var config = require('../config'),
	contents = function(){	
		return [
			'<div id="content fadein">',
			'<div class="text">',
			'<h2>' + config.app.title + '</h2>',
			'<p>Application ready!</p>',
			'<p>Version ' + config.app.version + ' (build ' + config.app.static.build + ')</p>',
			'</div>',
			'</div>'
		];
}
module.exports.contents = contents;