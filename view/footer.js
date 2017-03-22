var config = require('../config'),
	contents = function(){	
		return [
		    '</div>',
		    '<script src="' + config.app.static.scripts + 'scripts.' + config.app.static.build + '.min.js" type="text/javascript"></script>',
		    '</body></html>'
		];
}
module.exports.contents = contents;