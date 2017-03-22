var config = require('../../config');
module.exports = function render(templates) {
    return function *(next) {
        try {
            var layout = [];
            for (var i = 0; i < templates.length; i++) {
                if(templates[i] == 'results'){
                    layout.push(require('../../view/' + templates[i]).contents(this.request.body, this.state.rates, this.state.results).join(""));
                }else{
                    layout.push(require('../../view/' + templates[i]).contents().join(""));
                }
            }
            this.status = 200;
            this.type = config.content_type;
            this.body = layout.join("");
            yield next;
        } catch (err) {
            this.throw(err);
        }
    }
}