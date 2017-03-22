var contents = function(err){
		return [
		    '<div class="error fadein"><img src="/image/error.png" alt="Error">' + err.message,
		    //' (' + err.status + ')',
		    '</div>'
		];
}
module.exports.contents = contents;