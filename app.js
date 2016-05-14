#! /usr/bin/env node

// app.js

// rssi-monitor

'use strict';

var blessed = require('blessed');
var _ = require('lodash');
var nats = require('nats');

var nc = nats.connect();

nc.on('error', function (err) {
    console.log(err);
});

var screen = blessed.screen({
    smartCSR: true
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    void key;
    nc.close();
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

function makeDevice(id) {
    return 'rpi-' + _.padStart(id, 2, '0');
}

function makeContent(device, bars = 0) {
    return device + ' {green-fg}' + _.padStart('', bars, '|') + '{/green-fg}';
}

var id = 1;

var devices = [];

var numDevices = 10;

for (var i = 0; i < numDevices / 2; i++) {
    var device;
    device = makeDevice(id++);
    devices.push({ 'device': device, 'box': makeBox(screen, 1 + i * 3,  1, 40, 3, device) });
    device = makeDevice(id++);
    devices.push({ 'device': device, 'box': makeBox(screen, 1 + i * 3, 43, 40, 3, device) });
}

screen.render();

setInterval(function() {
    var device = makeDevice(_.random(1, devices.length));
    var value = _.random(0, 30);
    var msg = { 'device': device, 'value': value };
    nc.publish('beacons', JSON.stringify(msg));
}, 100);

nc.subscribe('beacons', function(msg) {
    var beacon = JSON.parse(msg);
    var device = _.find(devices, { 'device': beacon.device });
    device.box.setContent(makeContent(beacon.device, beacon.value));
    screen.render();
});

