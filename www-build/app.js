$(function () {
    pp.app.user = new pp.models.CurrentUser();

    var appView = pp.app.view = new pp.views.App({el: $('#wrap')});

    pp.app.onError = function(model, response) {
        var error;
        try {
            var parsedResponse = jQuery.parseJSON(response.responseText);
            error = parsedResponse.error;
        }
        catch(e) {
            error = "HTTP ERROR: " + response.status + " " + response.statusText;
        }

        console.log('error: ' + error);
        pp.app.view.notify('error', error);
    };

    pp.app.router = new (Backbone.Router.extend({
        routes: {
            "": "dashboard",
            "welcome": "welcome",
            "register": "register",
            "register/confirm/:login/:secret": "confirmEmail",
            "auth/twitter": "twitterLogin",
            "quest/add": "questAdd",
            "quest/:id": "questPage",
            "feed": "eventCollection",
            "players": "userList",
            "player/:login": "anotherDashboard",
            "explore(/:tab)": "explore",
            "about": "about",
        },

        // Google Analytics
        initialize: function() {
            return this.bind('all', this._trackPageview);
        },
        _trackPageview: function() {
            var url;
            url = Backbone.history.getFragment();
            return _gaq.push(['_trackPageview', "/" + url]);
        },

        questAdd: function () {
            var view = new pp.views.QuestAdd({ model: new pp.models.Quest() });
            appView.setPageView(view);
            setActiveMenuItem('add-quest');
        },

        questPage: function (id) {
            var view = new pp.views.QuestPage({ model: new pp.models.Quest({ _id: id }) });
            appView.setPageView(view);
            setActiveMenuItem('none');
        },

        welcome: function () {
            // model is usually empty, but sometimes it's not - logged-in users can see the welcome page too
            appView.setPageView(new pp.views.Home({ model: pp.app.user }));

            setActiveMenuItem('home');
        },

        dashboard: function () {
            if (!pp.app.user.get('registered')) {
                this.navigate('/welcome', { trigger: true, replace: true });
                return;
            }

            var view = new pp.views.Dashboard({ model: pp.app.user, current: true });
            view.activate(); // activate immediately, user is already fetched

            appView.setPageView(view);
            setActiveMenuItem('home');
        },

        anotherDashboard: function (login) {
            var user = new pp.models.AnotherUser({ login: login });
            var view = new pp.views.Dashboard({ model: user });
            user.fetch({
                success: function () {
                    view.activate();
                },
                error: pp.app.onError,
            });

            appView.setPageView(view);
            setActiveMenuItem('none');
        },

        explore: function (tab) {
            var view = new pp.views.Explore();
            if (tab != undefined) {
                view.tab = tab;
            }
            view.activate();

            appView.setPageView(view);
            setActiveMenuItem('explore');
        },

        userList: function () {
            var collection = new pp.models.UserCollection([], {
               'sort': 'leaderboard',
                'limit': 100,
            });
            var view = new pp.views.UserCollection({ collection: collection });
            collection.fetch({ error: pp.app.onError });
            appView.setPageView(view);
            setActiveMenuItem('user-list');
        },

        eventCollection: function () {
            var collection = new pp.models.EventCollection([], {
                'limit': 100
            });
            var view = new pp.views.EventCollection({ collection: collection });
            collection.fetch();
            appView.setPageView(view);
            setActiveMenuItem('event-list');
        },

        register: function () {
            console.log('route /register');
            if (!pp.app.view.currentUser.needsToRegister()) {
                console.log('going to /');
                this.navigate("/", { trigger: true, replace: true });
                return;
            }

            var view = new pp.views.Register({ model: pp.app.user });
            appView.setPageView(view); // not rendered yet
            setActiveMenuItem('home');
            view.render();
            console.log('rendered /register');
        },

        confirmEmail: function (login, secret) {
            var view = new pp.views.ConfirmEmail({ login: login, secret: secret });
            appView.setPageView(view);
            setActiveMenuItem('none');
        },

        twitterLogin: function () {
            window.location = '/auth/twitter';
        },

        about: function () {
            appView.setPageView(new pp.views.About());
            setActiveMenuItem('about');
        }
    }))();

    function setActiveMenuItem(selector) {
        appView.$el
            .find('.navbar .active')
                .removeClass('active')
                .end()
            .find('.menu-item-' + selector)
                .addClass('active');
    }

    pp.app.user.fetch({
        success: function () {
            // We're waiting for CurrentUser to be loaded before everything else.
            // It's a bit slower than starting the router immediately, but it prevents a few nasty race conditions.
            // Also, it's done just once, so all following navigation is actually *faster*.
            Backbone.history.start({ pushState: true });
            pp.app.user.on("error", pp.app.onError);
        },
        error: pp.app.onError, // todo - try to refetch user in a loop until backends goes online
    });

    $(document).on("click", "a[href='#']", function(event) {
        if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
            event.preventDefault();
        }
    });

    $(document).on("click", "a[href^='/']", function(event) {
        if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
            event.preventDefault();
            var url = $(event.currentTarget).attr("href").replace(/^\//, "");
            pp.app.router.navigate(url, { trigger: true });
        }
    });
});
