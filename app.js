var config = require('./config'),
	error_handler = require('./app_modules/error'),
	render = require('./app_modules/render'),
	compose = require('koa-compose'),
	// mongo = require('koa-mongo'),
	// parse = require('koa-formidable'),
	// validate = require('koa-validate'),
	route = require('koa-route'),
	timeout = require('koa-timeout')(config.timeout),
	limit = require('koa-better-ratelimit'),
	helmet = require('koa-helmet'),
	app = require('koa')();

if(config.app.env !== 'production') { app.use(require('koa-logger')()); }

if(config.app.static.server == 'koa') { app.use(require('koa-static')(config.app.static.public)); }

app.use(compose([
	error_handler(),
	helmet(),
	limit({"duration": 1000 * 60 * 60 * 2, "max": 250, "accessLimited" : config.error.limit }),
	timeout/*,
	mongo({"uri": config.db.url + config.db.name, "user" : config.db.user, "pass" : config.db.pwd, "max": config.db.max, "min": config.db.min, "timeout": config.db.timeout, "log": config.db.log}),
	parse({"encoding": "utf-8", "type" : "urlencoded", "maxFieldsSize" : 128}, this),
	validate(),
	process(),
	route.post('/x', render([ 'header', 'results', 'footer' ])),
	route.post('/y', render([ 'results' ]))*/
]));

app.listen(config.app.port, function(){
	console.log('# [app] ' + config.app.title + ' (' + config.app.version + ')');
	console.log('# [app] web server ready @ http://localhost:' + config.app.port);
});