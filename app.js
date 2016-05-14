#! /usr/bin/env node

// app.js

// rssi-monitor

'use strict';

var blessed = require('blessed');
var _ = require('lodash');

var screen = blessed.screen({
    smartCSR: true
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    void key;
    return process.exit(0);
});

screen.title = 'Bluetooth LE RSSI Monitor';

function makeBox(screen, top, left, width, height, content) {
    var box = blessed.box({
        top: top,
        left: left,
        width: width,
        height: height,
        content: content,
        tags: true,
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: '#f0f0f0'
            },
            hover: {
                bg: 'green'
            }
        }
    });

    screen.append(box);

    return box;
}

function makeContent(id, bars = 0) {
    var device = 'rpi-' + _.padStart(id, 2, '0');
    var gauge  = '{green-fg}' + _.padStart('', bars, '|') + '{/green-fg}';
    return device + ' ' + gauge;
}

var id = 1;
var boxes = [];

for (var i = 0; i < 5; i++) {
    boxes.push(makeBox(screen, 1 + i * 3,  1, 40, 3, makeContent(id++)));
    boxes.push(makeBox(screen, 1 + i * 3, 43, 40, 3, makeContent(id++)));
}

screen.render();

setInterval(function() {
    var i = _.random(0, boxes.length - 1);
    var box = boxes[i];
    var value = _.random(0, 30);
    box.setContent(makeContent(i + 1, value));
    screen.render();
}, 100);
