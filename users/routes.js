/*
*  All routes for the User model
*/

var User = require('./model'),
    random = require('../helpers/random'),
    bcrypt = require('bcrypt');

var user = {

    post: {

        /*
        *  Login
        *  @param username
        *  @param password
        */
        login: function(req, res) {
            var p = req.body;
            // Find the user
            User.findOne({ username: p.username }, function(e, user) {
                if (user) {
                    // Found the user, check the password
                    if (bcrypt.compareSync(p.password, user.password)) {
                        // Successful login, return an access token
                        // Generate a new access token
                        var token = random.string();
                        user.tokens.push(token);
                        user.save(function (e) {
                            if (e) {
                                // Error saving to db
                                console.log(e);
                                return res.send({
                                    "success": false,
                                    "accessToken": "",
                                    "message": "INTERNAL ERROR"
                                });
                            } else {
                                // Total success
                                return res.send({
                                    "success": true,
                                    "accessToken": token,
                                    "message": ""
                                });
                            }
                        });
                    } else {
                        // Incorrect password
                        console.log("incorrect password");
                        return res.send({
                            "success": false,
                            "accessToken": "",
                            "message": "BAD PASSWORD"
                        });
                    }
                } else {
                    // Incorrect username
                    console.log("incorrect username");
                    return res.send({
                        "success": false,
                        "accessToken": "",
                        "message": "BAD USERNAME"
                    });
                }
            });
        },

        /*
        *  Register
        *  @param username
        *  @param password
        *  @param device
        */
        register: function(req, res) {
            var p = req.body;
            // Check for an existing user
            User.findOne({ username: p.username }, function(e, user) {
                if (!user) {
                    // No user already exists
                    // Hash the password
                    var salt = bcrypt.genSaltSync(10);
                    var hash = bcrypt.hashSync(p.password, salt);
                    // Create the new user
                    var user = new User({
                        username: p.username,
                        password: hash,
                        device: p.device
                    });
                    // Generate a new access token
                    var token = random.string();
                    user.tokens.push(token);
                    // Save the new user
                    user.save(function (e) {
                        if (e) {
                            console.log(e);
                            // Error saving user
                            return res.send({
                                "success": false,
                                "accessToken": "",
                                "message": "INTERNAL ERROR"
                            });
                        }
                        else
                        {
                            // Everything works
                            return res.send({
                                "success": true,
                                "accessToken": token,
                                "message": ""
                            });
                        }
                    });
                } else {
                    // The username is taken
                    return res.send({
                        "success": false,
                        "accessToken": "",
                        "message": "USERNAME EXISTS"
                    });
                }
            });
        },

        /*
        *  Update a user's location
        *  @param accessToken
        *  @param username
        *  @param latitude
        *  @param longitude
        */
        location: function(req, res) {
            var p = req.body;
            // Get the user
            User.findOne({ username: p.username }, function (e, user) {
                if (user) {
                    // Check the token
                    var passed = false;
                    for (var i = 0; user.tokens.length; ++i) {
                        if (user.tokens[i] == p.accessToken) {
                            passed = true;
                            break;
                        }
                    }
                    if (passed) {
                        // Set lat and long
                        user.latitude = p.latitude;
                        user.longitude = p.longitude;
                        // Save users
                        user.save(function (e) {
                            if (e) {
                                // Internal error
                                return res.send({
                                    "success": false,
                                    "message": "INTERNAL ERROR"
                                });
                            } else {
                                // Everything worked
                                return res.send({
                                    "success": true,
                                    "message": ""
                                });
                            }
                        });
                    } else {
                        // Return access token error
                        return res.send({
                            "success": false,
                            "message": "BAD ACCESS TOKEN"
                        });
                    }
                } else {
                    // User not found
                    return res.send({
                        "success": false,
                        "message": "USER NOT FOUND"
                    });
                }
            });
        }

    },

    get: {

        /*
        *  Get a user object
        */
        self: function(req, res) {
            res.send('test');
        },

        /*
        *  Get a user's location
        */
        location: function(req, res) {
            res.send('test');
        },

        /*
        *  Get a user's device id
        */
        device: function(req, res) {
            res.send('test');
        }

    }

}

var friends = {

    post: {

        /*
        *  Add a friend
        */
        add: function(req, res) {
            res.send('test');
        },

        /*
        *  Reject a friend
        */
        reject: function(req, res) {
            res.send('test');
        }

    },

    get: {

        /*
        *  Get a friend's location
        */
        location: function(req, res) {
            res.send('test');
        }

    }

}

function setup(app) {
    /*
    *  /user routes
    */
    app.route('/user/login')
        .post(user.post.login);

    app.route('/user/register')
        .post(user.post.register);

    app.route('/user/location')
        .get(user.get.location)
        .post(user.post.location);

    app.route('/user')
        .get(user.get.self);

    app.route('/user/location')
        .get(user.get.location);

    app.route('/user/device')
        .get(user.get.device);

    /*
    *  /friends routes
    */
    app.route('/friends/add')
        .post(friends.post.add);

    app.route('/friends/reject')
        .post(friends.post.reject);

    app.route('/friends/location')
        .get(friends.get.location);
}

module.exports = setup;