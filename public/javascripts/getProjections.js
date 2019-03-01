var parameters = {
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

var inputs = Array.prototype.map.call(document.getElementsByTagName("input"), (e) => e); // Turn NodeList into Array
if (localStorage.getItem("parameters"))
{
    parameters = JSON.parse(localStorage.getItem("parameters"));
    inputs.forEach((el) => {el.value = parameters[el.name]});
}
const resultsDiv = $("#results");
document.getElementById("hatch").addEventListener("click", function() {
    var query = inputs.reduce(function(params, i) {
        if (i.value) {
            parameters[i.name] = i.value;
            params += "&" + i.name + "=" + i.value;
        }

        return params;
    }, "");

    localStorage.setItem("parameters", JSON.stringify(parameters));
    $.get("/projections?code=unused" + query, function(data) {
        if (data) {
            resultsDiv.html("");
            resultsDiv.append("<p>Eggs laid in time: " + data.eggsLaidInTime.toExponential(3) + "</p>");
            resultsDiv.append("<p>Time to goal: " + data.timeToGoal + "</p>");
        } else {
            resultsDiv.html("<p>No results to display</p>");
        }
    });
});