var async = require('async');
var fs = require('fs-extra');
var compressor = require('node-minify');
var package = require('./package.json');
var options = require('./src/config/build');

var Build = function(){

	options.fingerprint = (Number(Date.now()) / 1024).toFixed(0).slice(-5);

	console.log('# [build] ' + package.name + ' (' + package.version + ')');
	console.log('# [build] fingerprint: ' + options.fingerprint);

	async.waterfall([

		function Clean_Task(callback){

			Clean(function(error){

				(!error) ? callback(null) : callback(error);

			});

		},

		function Config_Task(callback){

			Config(function(error){

				(!error) ? callback(null) : callback(error);

			});

		},

		function Public_Dir_Task(callback){

			Public_Dir(function(error){

				(!error) ? callback(null) : callback(error);

			});

		},

		function Image_Task(callback){

			Images(function(error){

				(!error) ? callback(null) : callback(error);

			});

		},

		function Fonts_Task(callback){

			Fonts(function(error){

				(!error) ? callback(null) : callback(error);

			});

		},

		function Style_Task(callback){

			Styles(function(error){

				(!error) ? callback(null) : callback(error);

			});

		},

		function Scripts_Task(callback){

			Scripts(function(error){

				(!error) ? callback(null) : callback(error);

			});

		},

		function Pages_Task(callback){

			Pages(function(error){

				(!error) ? callback(null) : callback(error);

			});

		}


	],function (error) {

		(!error) ? console.log('# [build] all tasks completed ') : console.log('# [build] error: ' + error);

	});

}

function Clean(callback){

	async.waterfall([

		function Files_Remove(inner_callback){

			console.log('# [task] [clean] files: ' + options.clean.files);

			async.eachSeries(options.clean.files, function(file, inner_cb) {

				fs.remove(__dirname + '/' + file, function(error) {

					if(!error) {
						Success('# [task] [clean] file ' + file + ' removed', inner_cb);
					}else{
						inner_cb(error);
					}

				});

			}, function(error){

				(!error) ? inner_callback(null) : inner_callback(error);

			});

		},

		function Dir_Remove(inner_callback){

			console.log('# [task] [clean] directories: ' + options.clean.dir);

			async.eachSeries(options.clean.dir, function(dir, inner_cb) {

				fs.remove(__dirname + '/' + dir, function(error) {

					if(!error) {
						Success('# [task] [clean] directory ' + dir + ' removed', inner_cb);
					}else{
						inner_cb(error);
					}

				});

			}, function(error){

				(!error) ? inner_callback(null) : inner_callback(error);

			});

		}

	],function (error) {

		(!error) ? callback(null) : callback(error);

	});

}

function Config(callback) {

	async.waterfall([

		function Config_Task_Collect(inner_callback) {

			console.log('# [task] [config] files: ' + options.config.files);

			var list = Get_Filename(options.config.files, 'config', 'json');
			var i = 0;
			var arr = [];
			for(i; i < list.length; i++)
				arr.push(require(list[i]));

			var config = { "app" : { "static" : {}}};

	    	async.eachSeries(arr, function(obj, cb) {

	    		var k = Object.keys(obj);
	    		var i = 0;
	    		for(i; i < k.length; i++)
	    			config[k[i]] = obj[k[i]];

	    		cb(null);


			}, function(error){

				if(error) inner_callback(error);
			    if(!error) {
			    	config.app.description = package.description;
			    	config.app.version = package.version;
			    	config.app.static.build = options.fingerprint;
		    		config.app.static.style = options.style.dir;
		    		config.app.static.scripts = options.scripts.dir;
				    inner_callback(null, config);
				}

			});
		},

		function Config_Task_Write(config, inner_callback) {

			fs.writeFile(__dirname + options.root + 'config.json', JSON.stringify(config), function(error) {

			    (!error) ? Success('# [task] [config] new config.json saved in ' + __dirname  + '/', inner_callback) : inner_callback(error);

			});

		}


	],function (error) {

		(!error) ? callback(null) : callback(error);

	});

}

function Public_Dir(callback){

	fs.ensureDir(__dirname + options.static, function(error) {

		(!error) ? Success('# [task] [static] directory ' + options.static + ' created ', callback) : callback(error);

	});

}


function Images(callback){

	async.waterfall([

		function Images_Collect(inner_callback){

			fs.readdir(__dirname + options.src + options.image.dir, function(error, files){

				if(!error) inner_callback(null, files);

			})

		},

		function Images_Copy(files, inner_callback){

			if(files == ''){

				inner_callback(null);

			}else{

				var img_files = [];

				for (var i = 0; i < files.length; i++) {
					var ext = files[i].substr(files[i].lastIndexOf('.') + 1);
					if((ext == 'jpg') || (ext == 'png') || (ext == 'ico')) img_files.push(files[i]);
		        }

				console.log('# [task] [image] files: ' + img_files);

				async.eachSeries(img_files, function(file, inner_cb) {

					var dest = __dirname + options.static + options.image.dir + file;

					if(file == 'favicon.ico') dest = __dirname + options.static + file;

					fs.copy(__dirname + options.src + options.image.dir + file, dest, function(error) {

						if(!error) {
							Success('# [task] [image] file ' + file + ' copied to ' + options.static + options.image.dir, inner_cb);
						}else{
							inner_cb(error);
						}

					});

				}, function(error){

					(!error) ? inner_callback(null) : inner_callback(error);

				});

			}

		}


	],function (error) {

		(!error) ? callback(null) : callback(error);

	});

}

function Fonts(callback){

	console.log('# [task] [fonts] files: ' + options.fonts.files);

	var css = [

		'@charset "utf-8";'
	];

	if(options.fonts.files == ''){

		console.log('# [task] [fonts] nothing to build');
		callback(null);

	}else{

		async.waterfall([

			function Fonts_Files(outer_callback){

				async.eachSeries(options.fonts.files, function(font, cb) {

					console.log('# [task] [fonts] font: ' + font);

					async.waterfall([

						function Fonts_Collect(inner_callback){

							fs.readdir(__dirname + options.src + options.fonts.dir + font, function(error, files){

								(!error) ? inner_callback(null, files) : inner_callback(error);

							});

						},
						
						function Fonts_Copy(files, inner_callback){

							async.eachSeries(files, function(file, inner_cb) {

								fs.copy(__dirname + options.src + options.fonts.dir + font + '/' + file, __dirname + options.static + options.fonts.dir + file, function(error) {

									if(!error) {
										Success('# [task] [fonts] ' + file + ' copied to ' + options.static + options.fonts.dir, inner_cb);
									}else{
										inner_cb(error);
									}

								});

							}, function(error){

								(!error) ? inner_callback(null, files) : inner_callback(error);

							});
						},

						function Fonts_Css(files, inner_callback){

							font_css = Font_Css_Template(font, files);

							css.push(font_css);

							inner_callback(null);

						}


					],function (error) {

						(!error) ? cb(null) : cb(error);

					});


				}, function (error){

					(!error) ? outer_callback(null) : outer_callback(error);


				});

			},

			function Fonts_Css_Write(outer_callback){

				var once = Number(options.fonts.files.length) + 1;
				var i = 0;
				var arr = [];
				for(i; i < once; i++){

					arr.push(css[i]);
				}

				arr.push('html,body{font-family: ' + options.fonts.default_font + options.fonts.font_family + ' sans-serif;}');

				var flatten = [];
				flatten = flatten.concat.apply(flatten, arr);
				
				fs.outputFile(__dirname + options.src + options.style.dir + 'fonts.css', flatten.join(' '), function(error) {

					if(!error) {
						Success('# [task] [fonts] updated fonts.css in /src/' + options.style.dir, outer_callback);
					}else{
						outer_callback(error);
					}

				});

			}


		],function (error) {

			(!error) ? callback(null) : callback(error);

		});
		
	}

}

var Font_Css_Template = function(font, files){

	var chunk = [
		'@font-face{',
	    'font-family: "' + font + '";',
	    'font-weight: "normal";',
	    'font-style: "normal";',
	    'font-stretch: "normal";',
	    'src:',
	    Font_Url(font, files),
	    //'unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215, U+E0FF, U+EFFD, U+F000;',
	    '}'
	];

	function Font_Url(font, files){

		var i = 0;
		var arr = [];
		for(i; i < files.length; i++){

			if(files[i].split('.')[1].toLowerCase() == 'eot') arr.push('url(\'../' + options.fonts.dir + files[i] + '\') format(\'embedded-opentype\')');
			if(files[i].split('.')[1].toLowerCase() == 'otf') arr.push('url(\'../' + options.fonts.dir + files[i] + '\') format(\'opentype\')');
			if(files[i].split('.')[1].toLowerCase() == 'ttf') arr.push('url(\'../' + options.fonts.dir + files[i] + '\') format(\'truetype\')');
			if(files[i].split('.')[1].toLowerCase() == 'woff') arr.push('url(\'../' + options.fonts.dir + files[i] + '\') format(\'woff\')');
			if(files[i].split('.')[1].toLowerCase() == 'woff2') arr.push('url(\'../' + options.fonts.dir + files[i] + '\') format(\'woff2\')');
			if(files[i].split('.')[1].toLowerCase() == 'svg') arr.push('url(\'../' + options.fonts.dir + files[i] + '#' + font + '\') format(\'svg\')');
		}

		return arr.join(", ").toString();
	}

	return chunk;

}

function Styles(callback){

	var config = require('./config.json');

	console.log('# [task] [style] files: ' + options.style.files);
	var list = Get_Filename(options.style.files, 'style', 'css');
	if(list == ''){
		console.log('# [task] [style] nothing to build');
		callback(null);
	}else{
		new compressor.minify({
			type: 'yui-css',
			fileIn: list,
			fileOut: __dirname + options.static + options.style.dir + 'screen.' + options.fingerprint + '.min.css',

				callback: function(error, result){

					(!error) ? Success('# [task] [style] new screen.' + options.fingerprint + '.min.css saved in ' + options.static + options.style.dir, callback) : callback(error);

				}

		});
	}
}

function Scripts(callback) {

	var config = require('./config.json');

	console.log('# [task] [scripts] files: ' + options.scripts.files);
	var list = Get_Filename(options.scripts.files, 'scripts', 'js');
	if(list == ''){
		console.log('# [task] [scripts] nothing to build');
		callback(null);
	}else{
		new compressor.minify({
			type: 'yui-js',
			fileIn: list,
			fileOut: __dirname + options.static + options.scripts.dir + 'scripts.' + options.fingerprint + '.min.js',

				callback: function(error, result){

					(!error) ? Success('# [task] [scripts] new scripts.' + options.fingerprint + '.min.js saved in ' + options.static + options.scripts.dir, callback) : callback(error);

				}
		});

	}

}

function Pages(callback) {

	var files = Object.keys(options.html);

	console.log('# [task] [html] files: ' + files);

	async.eachSeries(files, function(page, cb) {

		console.log('# [task] [html] page: ' + page);

		var templates = options.html[page].views;
		var html = [];

		for (var i = 0; i < templates.length; i++) {
			html.push(require('./view/' + templates[i]).contents().join(""));
		}

		fs.writeFile(__dirname + options.static + options.html[page].filename, html.join(""), function(error) {

		    (!error) ? Success('# [task] [html] ' + page + ' saved at ' + __dirname  + options.static, cb) : cb(error);

		});

	}, function (error){

		(!error) ? callback(null) : callback(error);

	});

}

var Get_Filename = function(list, task, ext){

	var i = 0;
	var arr = [];
	for(i; i < list.length; i++)
		arr.push(__dirname + options.src + task + '/' + list[i] + '.' + ext);
	return arr;

}

var Success = function(msg, callback){

	console.log(msg);
	callback(null);
}

Build();