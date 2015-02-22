var container = document.querySelector('.items-container');
var msnry = new Masonry( container, {
    // options
    columnWidth: 300,
    itemSelector: '.item',
    gutter: 5
});

var STREAMER = $('html').data('stream-server');
var use_cached_selectors = true;

var score_cache = {};
var selector_cache = {};

var scoreCacheInit = function() {
    var nodes = document.querySelectorAll('.items-container .item span');

    for(var i = 0; i < nodes.length; i++) {
        score_cache[nodes[i].id.replace('score-','')] = parseInt(nodes[i].innerHTML);
    }
};

var get_cached_selectors = function(id) {
    var container_selector;
    var score_selector;

    if (selector_cache[id] !== void 0) {
        return [this.selector_cache[id][0], this.selector_cache[id][1]];
    } else {
        score_selector = document.getElementById('score-' + id);
        container_selector = document.getElementById('country-' + id);
        selector_cache[id] = [score_selector, container_selector];
        return [score_selector, container_selector];
    }
};

var incrementScore = function(id, incrby) {
    if (incrby === null || incrby === undefined) {
        incrby = 1;
    }

    var cachedSelector;
    var container_selector;
    var score_selector;

    if (use_cached_selectors) {
        cachedSelector = get_cached_selectors(id);

        score_selector = cachedSelector[0];
        container_selector = cachedSelector[1];
    } else {
        score_selector = document.getElementById('score-' + id);
        container_selector = document.getElementById('country-' + id);
    }

    if (isNaN(this.score_cache[id])) {
        console.log(id);
    }

    score_selector.innerHTML = (this.score_cache[id] += incrby);

    container_selector.classList.add('highlight_score_update_trans');
    return setTimeout(function() {
        return container_selector.classList.remove('highlight_score_update_trans');
    });
};

var initSSEStream = function() {
    var source = new EventSource(STREAMER + '/subscribe/raw');

    source.onmessage = function(event) {
        incrementScore(event.data);
    };

    source.onerror = function(err) {
        console.log(err);
    };

    source.onopen = function() {
        console.log('SSE con opened!');
    };
};

scoreCacheInit();
initSSEStream();
