Pointr
==============
Friend-based wayfinding.
--------------

## Base URL

`http://pointr-backend.herokuapp.com`

## Error Codes

```javascript
"INTERNAL ERROR"
"BAD PASSWORD"
"BAD USERNAME"
"USERNAME EXISTS"
"BAD ACCESS TOKEN"
"USER NOT FOUND"
"ALREADY FRIEND"
```

## User Routes

### /user/login

#### POST

 - username
 - password

#### RETURN

```javascript
// Success
{
    "success": true,
    "accessToken": "aergerh75erh42h35",
    "message": ""
}

// Failure
{
    "success": false,
    "accessToken": "",
    "message": "Invalid login credentials."
}
```

### /user/register

#### POST

 - username
 - password
 - device

#### RETURN

```javascript
// Success
{
    "success": true,
    "accessToken": "aergerh75erh42h35",
    "message": ""
}

// Failure
{
    "success": false,
    "accessToken": "",
    "message": "The username already exists"
}
```

### /user/location

#### POST

 - accessToken
 - username
 - latitude
 - longitude

#### RETURN

```javascript
// Success
{
    "success": true,
    "message": ""
}

// Failure
{
    "success": false,
    "message": "BAD ACCESS TOKEN"
}
```

### /user

#### GET

 - username

#### RETURN

```javascript
// Success
{
    username: "test",
    longitude: 23.34626,
    latitude: 45.2325,
    device: "wergwerh34523qwgg31g23t",
    friends: [
        "userA",
        "userB",
        "userC"
    ]
}

// Failure
{
    "success": false,
    "message": "BAD USERNAME"
}
```

### /user/location

#### GET

 - accessToken
 - username

#### RETURN

```javascript
// Success
{
    "success": true,
    "latitude": user.latitude,
    "longitude": user.longitude,
    "message": ""
}

// Failure
{
    "success": false,
    "latitude": 0.0,
    "longitude": 0.0,
    "message": "BAD USERNAME"
}
```

### /user/device

#### GET

 - accessToken
 - username

#### RETURNS

```javascript
// Success
{
    "success": true,
    "message": "",
    "device": user.device
}

// Failure
{
    "success": false,
    "message": "BAD ACCESS TOKEN",
    "device": ""
}
```

### /user/friends

#### GET

 - accessToken
 - username

#### RETURNS

```javascript
// Success
{
    "success": true,
    "friends": [ "steve", "sergei", "bill" ],
    "suitors": [ "elon" ],
    "message": ""
}

// - or -
{
    "success": true,
    "friends": [],
    "suitors": [],
    "message": ""
}

// Failure
{
    "success": false,
    "message": "BAD ACCESS TOKEN"
}
```

### /friends/add

#### POST

 - accessToken
 - username
 - friend_username

#### RETURNS

```javascript
// Success
{
    "success": true,
    "message": ""
}

// Failure
{
    "success": false,
    "message": "INTERNAL ERROR"
}
```

### /friends/reject

#### POST

 - accessToken
 - username
 - friend_username

#### RETURNS

```javascript
// Success
{
    "success": true,
    "message": ""
}

// Failure
{
    "success": false,
    "message": "INTERNAL ERROR"
}
```

### /friends/location

### GET

 - accessToken
 - username (of friend)

### RETURNS

```javascript
// Success
{
    "success": true,
    "message": "",
    "latitude": user.latitude,
    "longitude": user.longitude
}

// Failure
{
    "success": false,
    "message": "BAD USERNAME",
    "latitude": 0.0,
    "longitude": 0.0
}
```
