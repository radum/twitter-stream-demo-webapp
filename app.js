'use strict';

var express = require('express');
var exphbs  = require('express-handlebars');
var RSVP = require('RSVP');
var path = require('path');
var _ = require('lodash');
var countries = require('./countries.json');

var redisConfig = {
    host: '192.168.59.103',
    port: 6379
};

var url = require('url').parse(process.env.REDISCLOUD_URL || '');

if(url.hostname !== null) {
    redisConfig = {
        host: url.hostname,
        port: url.port
    };
}

var redis = require('redis').createClient(redisConfig.port, redisConfig.host);

if(url.hostname !== null) {
    redis.auth(url.auth.split(':')[1]);
}

var app = express();

app.use(express.static(path.join(__dirname, 'public')));


app.engine('hbs', exphbs({extname: '.hbs', defaultLayout: 'main'}));
app.set('view engine', 'hbs');

var getRankings = function() {
    var promise = new RSVP.Promise(function(resolve, reject) {
        redis.zrevrange(['country_score', 0, -1, 'WITHSCORES'], function(err, response) {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        });
    });

    return promise;
};

app.get('/', function (req, res) {
    getRankings().then(function(raw_scores) {
        var scores = [];

        for(var i = 0; i < raw_scores.length; i+=2 ) {
            scores.push({
                'id': _.indexOf(countries, raw_scores[i]),
                'name': raw_scores[i],
                'score': parseInt(raw_scores[i+1])
            });
        }

        var emptyCountries = _.difference(countries, raw_scores);

        for(i = 0; i < emptyCountries.length; i++) {
            scores.push({
                'id': countries.indexOf(emptyCountries[i]),
                'name': emptyCountries[i],
                'score': 0
            });
        }

        res.render('home', {
            'STREAMER-SERVER': 'http://local.dev:8080',
            rankings: scores,
            total: scores.length
        });
    }, function(error) {
        console.log(error);
    });
});

app.set('port', (process.env.PORT || 9000));

app.listen(app.get('port'), function() {
    console.log('Node app is running at localhost:' + app.get('port'));
});
