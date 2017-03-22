var config = require('../../config');
module.exports = function error_handler() {
    return function *(next) {
        try {
            yield next;
        } catch (err) {
            require("fs").appendFile("../../log/app_error", new Date().toUTCString() + ' - ' + err.message + '\n', function(){});
            switch (err.status){
                case '404':
                    this.status = 404;
                    err.message = config.error.notfound;
                break;
                case '408':
                    this.status = 408;
                    err.message = config.error.timeout;
                break;
                case '500':
                    this.status = 500;
                    err.message = config.error.server;
                break;
                default:
                    this.status = 500;
                    if((err.message == undefined) || (err.message == '')) err.message = config.error.message;
            }
            this.type = config.content_type;
            this.body = require('../../view/error').contents(err).join("");
            if(config.app.env !== 'production') this.app.emit('error', err, this);
        }
    }
}