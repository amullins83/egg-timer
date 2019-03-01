const defaultProperties = {
    eggsPerMinute: 0,
    internalHatcheryRate: 0,
    timeRemaining: 0,
    goal: 0,
    chickens: 0,
    eggs: 0,
    levelsCalm: 20,
    shippingRate: 5.294854e13,
    habCapacity: 189e7,
    numHabs: 4
};

const secondsMap = {
    d: 86400,
    h: 3600,
    m: 60,
    s: 1
};

const timeRegex = /(\d+)?(.)?(\d+)?(.)?(\d+)?(.)?(\d+)?(.)?/;

var lastSentProperties = {}; // Cache properties object to re-use calculations
var lastCalculatedProperties = {};

function parseTime(timeString)
{
    const matchObject = timeString.match(timeRegex);
    var value = 0;
    var total = 0;
    for (var i = 1; i < matchObject.length && matchObject[i]; i++) {
        if (i % 2 == 0)
            total += (secondsMap[matchObject[i]] ? value * secondsMap[matchObject[i]] : 0);
        else
            value = parseInt(matchObject[i]);
    }
    return total;
}

function printTime(timeInSeconds)
{
    var days = Math.floor(timeInSeconds/24/3600);
    var timeAfterDays = timeInSeconds - days*24*3600;
    var hours = Math.floor(timeAfterDays/3600);
    var timeAfterHours = timeAfterDays - hours*3600;
    var minutes = Math.floor(timeAfterHours/60);
    var seconds = Math.floor(timeAfterHours - minutes*60);
    var output = "";
    if (days > 0)
        output += days + "d";
    if (hours > 0)
        output += hours + "h";
    if (minutes > 0)
        output += minutes + "m";
    if (seconds > 0)
        output += seconds + "s";
    return output;
}

function quadratic(a, b, c)
{
    if (a == 0 && b == 0)
        return 0; // Default to 0 for no dependence on x
    else if (a == 0)
        return -c/b; // bx + c == 0
    return (-b + Math.sqrt(b*b - 4*a*c))/(2*a); 
}

function constantAcceleration(acc, vel, initial, time)
{
    return 0.5*acc*time*time + vel*time + initial;
}

function fillDefaults(properties) {
    if (typeof properties != "object")
        return defaultProperties;
    else
    {
        var props = Object.create(properties);
        for (var key in defaultProperties) {
            if (typeof props[key] === "undefined")
                props[key] = defaultProperties[key];
        }
        return props;
    }
}

function sharedCalculations(properties) {
    var props = fillDefaults(properties);

    props.eggsPerSecond = props.eggsPerMinute / 60.0;
    props.calmBonus = 1 + 0.1*props.levelsCalm;
    props.chickensPerMinute = props.internalHatcheryRate*props.calmBonus*props.numHabs;
    props.chickensPerSecond = props.chickensPerMinute / 60.0;
    props.eggsPerSecondPerChicken = props.eggsPerSecond / props.chickens;
    props.eggseleration = props.eggsPerSecondPerChicken * props.chickensPerSecond;
    props.secondsRemaining = parseTime(props.timeRemaining);
    props.habCapacityEggRateLimit = props.habCapacity * props.eggsPerSecondPerChicken;
    props.shippingRateLimit = props.shippingRate / 60.0; // shipping rate is per minute
    props.maxEggRate = Math.min(props.habCapacityEggRateLimit, props.shippingRateLimit);
    props.timeToMaxEggRate = (props.eggseleration == 0 ? Infinity : (props.maxEggRate - props.eggsPerSecond)/props.eggseleration);
    props.eggsLaidBeforeMaxEggRate = constantAcceleration(props.eggseleration, props.eggsPerSecond, props.eggs,
                                                          Math.min(props.secondsRemaining, props.timeToMaxEggRate));

    lastSentProperties = properties; // Cache the argument for comparison
    lastCalculatedProperties = props;                                                        
    return props;
}

function getCalculations(properties)
{
    return (properties == lastSentProperties ? lastCalculatedProperties : sharedCalculations(properties));
}

function eggsLaidInTime(properties)
{
    var props = sharedCalculations(properties);
    var eggs = props.eggsLaidBeforeMaxEggRate;
    if (props.secondsRemaining <= props.timeToMaxEggRate)
        return eggs;
    return eggs + props.maxEggRate * (props.secondsRemaining - props.timeToMaxEggRate);
}

function timeToGoalInSeconds(properties)
{
    var props = sharedCalculations(properties);
    if (props.eggsLaidBeforeMaxEggRate > props.goal) // We reached the goal before hitting max rate
        return quadratic(0.5*props.eggseleration, props.eggsPerSecond, props.eggs - props.goal); // Constant acceleration
    else { // We will spend some time at max rate
        return props.timeToMaxEggRate + (props.goal - props.eggsLaidBeforeMaxEggRate)/props.maxEggRate;
    }
}

function timeToGoal(properties)
{
    return printTime(timeToGoalInSeconds(properties));
}

module.exports = {
    eggsLaidInTime,
    timeToGoal,
    defaultProperties
};
