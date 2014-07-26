module.exports.token = function(token, tokens) {
    var passed = false;
    for (var i = 0; tokens.length; ++i) {
        if (tokens[i] == token) {
            passed = true;
            break;
        }
    }
    return passed;
}