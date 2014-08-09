/*
*  All routes for the User model
*  @todo fix the way we check access tokens in every route (middleware)
*  @todo implement a client secret code
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
                        return res.send({
                            "success": false,
                            "accessToken": "",
                            "message": "BAD PASSWORD"
                        });
                    }
                } else {
                    // Incorrect username
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
        },

        /*
        *  Update a user's device
        *  @param accessToken
        *  @param username
        *  @param device
        *  @param deviceType
        */
        device: function(req, res) {
            var p = req.body;
            // Get the user
            User.findOne({ username: p.username }, function (e, user) {
                if (user) {
                    // Check the token
                    if (check.token(p.accessToken, user.tokens)) {
                        // Set device and deviceType
                        user.device = p.device;
                        user.deviceType = p.deviceType;
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
            var p = req.query;
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
        *  @param accessToken
        *  @param username
        */
        location: function(req, res) {
            var p = req.query;
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
            var p = req.query;
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
        },

        /*
        *  Get a list of friends
        *  @param accessToken
        *  @param username
        */
        friends: function(req, res) {
            var p = req.query;
            // Get the user
            User.findOne({ username: p.username }, function (e, user) {
                if (user) {
                    // Check access token
                    if (check.token(p.accessToken, user.tokens)) {
                        return res.send({
                            "success": true,
                            "friends": user.friends,
                            "suitors": user.pending
                        });
                    } else {
                        // Bad access token
                        return res.send({
                            "success": false,
                            "message": "BAD ACCESS TOKEN"
                        });
                    }
                } else {
                    // User not found
                    return res.send({
                        "success": false,
                        "message": "BAD USERNAME"
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
                                var index = user.pending.indexOf(friend.username);
                                if (index > -1) {
                                    user.pending.splice(index, 1);
                                }
                                user.save(function (e) {
                                    if (!e) {
                                        // Move user to friend.friends
                                        friend.friends.push(user.username);
                                        var i = friend.pending.indexOf(user.username);
                                        if (index > -1) {
                                            friend.pending.splice(i, 1);
                                        }
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
                                friend.save(function (e) {
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
        *  @param accessToken
        *  @param username
        *  @param friend_username
        */
        reject: function(req, res) {
            var p = req.body;
            // Remove friend from username.pending
            User.findOne({ username: p.username }, function(e, user) {
                var i = user.pending.indexOf(p.friend_username);
                if (i > -1) {
                    user.pending.splice(i, 1);
                }
                user.save(function (e) {
                    if (!e) {
                        // Remove username from friend.pending
                        User.findOne({ username: p.friend_username }, function (e, friend) {
                            var j = friend.pending.indexOf(user.username);
                            if (j > -1) {
                                friend.pending.splice(j, 1);
                            }
                            friend.save(function (e) {
                                if (!e) {
                                    // Everything worked
                                    return res.send({
                                        "success": true,
                                        "message": ""
                                    });
                                } else {
                                    // DB error
                                    return res.send({
                                        "success": false,
                                        "message": "INTERNAL ERROR"
                                    });
                                }
                            });
                        });
                    } else {
                        // DB error
                        return res.send({
                            "success": false,
                            "message": "INTERNAL ERROR"
                        });
                    }
                });
            });
        }

    },

    get: {

        /*
        *  Get a friend's location
        *  @param username
        *  @param accessToken
        */
        location: function(req, res) {
            var p = req.query;
            User.findOne({ username: p.username }, function (e, user) {
                if (user) {
                    // found user
                    return res.send({
                        "success": true,
                        "message": "",
                        "latitude": user.latitude,
                        "longitude": user.longitude
                    });
                } else {
                    // user doesn't exist
                    return res.send({
                        "success": false,
                        "message": "BAD USERNAME",
                        "latitude": 0.0,
                        "longitude": 0.0
                    });
                }
            });
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
        .post(user.post.device)
        .get(user.get.device);

    app.route('/user/friends')
        .get(user.get.friends);

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
