var path = require("path");
var eggTimer = require(path.join(__dirname, "..", "eggTimer.js"));
var express = require('express');
var router = express.Router();

router.get("/", function(req, res, next) {
    var props = null;

    if (req.body && req.body.eggProperties) {
        props = req.body.eggProperties;
    } else if (req.query) {
        props = Object.create(req.query);
        for (var key in props) {
            if (key != "timeRemaining") {
                props[key] = parseFloat(props[key]);
            }
        }
    }

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    if (props === null) {
        res.status(400).json({
            error: "No egg timer properties found in query or request body"
        });
    }
    else {
        res.json({
            eggsLaidInTime: eggTimer.eggsLaidInTime(props),
            timeToGoal: eggTimer.timeToGoal(props)
        });
    }
});

module.exports = router;