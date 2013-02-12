## All API urls

Read the code (`lib/Play/Route/*.pm`) or try them in the browser for the response format.
Hint: it's usually JSON.

### Personal stuff - auth, settings, etc.

##### GET /auth/twitter

Go to Twitter, obtain login, set `twitter_user` session key and return to `/register` (frontend one, not `/api/register`!)

##### GET /api/current_user

Get current user.

`registered=1` flag means the user is fully registered. Otherwise json still can contain some info (e.g. Twitter).

##### POST /api/register

Register the new user login, associate it with the current twitter user, save to db.

`settings` param can contain initial user settings (json-encoded).

##### GET /api/fakeuser/{login}

Fake analog of `/api/register`; dev mode only.

`notwitter` cgi param disables fake twitter account generation.

##### GET /api/current_user/settings

Get current user's settings.

##### PUT /api/current_user/settings`

Update current user's settings.

##### POST /api/current_user/settings

Same as `PUT` - both rewrite settings entirely.

### Players

##### GET /api/user/{login}

Get any user data.

##### GET /api/user

Get the list of all users.

### Quests

##### POST /api/quest

Add a new quest for the current user.

##### PUT /api/quest/{id}

Update a quest.

##### DELETE /api/quest/{id}

Delete a quest.

(actually, set its status to `deleted`; it won't be shown in `/api/quests` and won't be fetchable by its id.)

##### GET /api/quest

Get all quests.

##### GET /api/quest?user={login}

Get all quests of a given user.

##### GET /api/quest?status={status}

Get all quests with a given status.

##### GET /api/quest/{id}

Get one quest.

##### POST /api/quest/{quest_id}/comment

Add a new comment.

##### GET /api/quest/{quest_id}/comment

Get all quest's comments.

##### GET /api/quest/{quest_id}/comment/{comment_id}

Get a single comment.

##### POST /api/quest/{id}/like

Like a quest.

##### POST /api/quest/{id}/unlike

Unlike a quest.

### Other

##### GET /api/event

Get last 100 events.

##### GET /api/dev/session/{name}

Get session value. Dev mode only.

## Registration

This is how registration is implemented:

1. JS redirects to `/auth/twitter`
2. `/auth/twitter` redirects to twitter.com
3. twitter.com redirects back to `/auth/twitter`
4. `/auth/twitter`, now with the correct twitter login in user's session, redirects to `/register`
5. JS checks whether the user has both twitter login and service login (using `/api/current_user`); if there's no service login, it shows the registration form
6. User enters his new service login in the registration form, JS calls `/api/register`, and now we're fully registered.

`/api/current_user` is always the key for frontend to check the current authentification status.

## Objects

User:

    {
        _id: ...,
        login: 'blah',
        points: 123,
        twitter: {
            screen_name: 'blah'
        }
    }

Quest:

    {
        _id: ...,
        status: 'open', // or 'closed'
        user: 'blah',
        name: 'quest title',
        type: 'bug'     // or 'blog', or 'feature'
        likes: [
            'foo-user',
            'bar-user'
        ]
    }

Comment:

    {
        _id: ...,
        body: 'comment body',
        quest_id: ...,
        author: 'foo-user'
    }

Settings:

    {
        email: "president@barackobama.com",
        notify_comments: 1,
        notify_likes: 0,

        // these last two fields are implementation details and probably will be removed
        user: "barack",
        result: "ok"
    }