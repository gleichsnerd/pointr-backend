/*
*  All routes for the User model
*/

var User = require('./model'),
    random = require('../helpers/random'),
    bcrypt = require('bcrypt'),
    check = require('../helpers/check');

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
                    if (check.token(p.accessToken, user.tokens)) {
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
        *  @param username
        */
        self: function(req, res) {
            var p = req.body;
            User.findOne({ username: p.username }, 'username longitude latitude device friends', function (e, user) {
                if (user) {
                    // Return the user object
                    return res.send(user);
                } else {
                    // Invalid username
                    return res.send({
                        "success": false,
                        "message": "BAD USERNAME"
                    });
                }
            });
        },

        /*
        *  Get a user's location
        *  @todo push notifications
        *  @param accessToken
        *  @param username
        */
        location: function(req, res) {
            User.findOne({ username: p.username }, function (e, user) {
                if (user) {
                    // Return the location
                    return res.send({
                        "success": true,
                        "latitude": user.latitude,
                        "longitude": user.longitude,
                        "message": ""
                    });
                } else {
                    // User not found
                    return res.send({
                        "success": false,
                        "latitude": 0.0,
                        "longitude": 0.0,
                        "message": "BAD USERNAME"
                    });
                }
            });
        },

        /*
        *  Get a user's device id
        *  @param accessToken
        *  @param username
        */
        device: function(req, res) {
            var p = req.body;
            User.findOne({ username: p.username }, function (e, user) {
                if (user) {
                    // Check access token
                    if (check.token(p.accessToken, user.tokens)) {
                        // Everything worked
                        return res.send({
                            "success": true,
                            "message": "",
                            "device": user.device
                        });
                    } else {
                        // Bad access token
                        return res.send({
                            "success": false,
                            "message": "BAD ACCESS TOKEN",
                            "device": ""
                        });
                    }
                } else {
                    // Bad username
                    return res.send({
                        "success": false,
                        "message": "BAD USERNAME",
                        "device": ""
                    });
                }
            });
        }

    }

}

var friends = {

    post: {

        /*
        *  Add a friend
        *  @param accessToken
        *  @param username
        *  @param friend_username
        */
        add: function(req, res) {
            var p = req.body;
            // Get both users
            User.findOne({ username: p.username }, function (e, user) {
                if (user) {
                    User.findOne({ username: p.friend_username }, function (e, friend) {
                        if (friend) {
                            // Check if username is in friend_username.pending
                            var isPending = false;
                            for (var i = 0; i < friend.pending.length; ++i) {
                                if (user.username == friend.pending[i]) {
                                    isPending = true;
                                    break;
                                }
                            }
                            if (isPending) {
                                // Move friend to user.friends
                                user.friends.push(friend.username);
                                user.save(function (e) {
                                    if (!e) {
                                        // Move user to friend.friends
                                        friend.friends.push(user.username);
                                        friend.save(function (e) {
                                            if (!e) {
                                                // Everything was successful!
                                                return res.send({
                                                    "success": true,
                                                    "message": ""
                                                });
                                            } else {
                                                // Database error
                                                return res.send({
                                                    "success": false,
                                                    "message": "INTERNAL ERROR"
                                                });
                                            }
                                        });
                                    } else {
                                        // Database error
                                        return res.send({
                                            "success": false,
                                            "message": "INTERNAL ERROR"
                                        })
                                    }
                                });
                            } else {
                                // Put user in friend.pending
                                friend.pending.push(user.username);
                                user.save(function (e) {
                                    if (!e) {
                                        // Put friend in user.pending
                                        user.pending.push(friend.username);
                                        user.save(function (e) {
                                            if (!e) {
                                                // Everything worked!
                                                return res.send({
                                                    "success": true,
                                                    "message": ""
                                                });
                                            } else {
                                                // Database error
                                                return res.send({
                                                    "success": false,
                                                    "message": "INTERNAL ERROR"
                                                });
                                            }
                                        })
                                    } else {
                                        // Database error
                                        return res.send({
                                            "success": false,
                                            "message": "INTERNAL ERROR"
                                        });
                                    }
                                });
                            }
                        } else {
                            // Friend not found
                            return res.send({
                                "success": false,
                                "message": "BAD USERNAME"
                            });
                        }
                    });
                } else {
                    // User not found
                    return res.send({
                        "success": false,
                        "message": "BAD USERNAME"
                    });
                }
            });
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