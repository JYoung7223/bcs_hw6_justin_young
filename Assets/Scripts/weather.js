/***** Local Variables *****/
let lastSearch = "";
let weatherAPIKey = "a115d20ebd38d51609412e1e1556337d";
let weatherAPIEndpoint = "https://api.openweathermap.org/data/2.5/forecast?appid="+weatherAPIKey+"&q=";

/***** DOM elements *****/
var searchHistoryEl = $("#search-history");
var searchEl = $("#search");
var cityNameEl = $("#city-name");
var day0El = $("#day-0");
var day0TempEl = $("#day-0-temp");
var day0HumidityEl = $("#day-0-humidity");
var day0WindEl = $("#day-0-wind");
var day0UVIndexEl = $("#day-0-uv-index");
var forecastEl = $("#forecast");

/***** Event Listeners *****/
$("#search-btn").on("click", requestedWeather);
$("#search-history").on("click", requestedWeather);

/***** Helper Functions *****/
function requestedWeather(event) {
    // New Search or Repeat
    var targetId = event.target.id;
    if ((targetId === "search-btn") || (targetId === "search-icon")) {
        // New Search
        lastSearch = searchEl[0].value;
        if (lastSearch.trim().length < 1) {
            alert("Must enter a city to search");
            return;
        }
        retrieveWeather(lastSearch);
    } else {
        // Repeat
        lastSearch = $("#"+targetId).attr("data-city");
        retrieveWeather(lastSearch);
    }
}

// This function will attempt to get the weather data for the given city
function retrieveWeather(city){
        console.log("Getting Weather For:"+city);
        $.ajax({
            url: weatherAPIEndpoint+city,
            method: "GET"
        })
        .then(populateWeather)
        // .fail(function(err){
        //     console.log("Error");
        //     console.log(err)
        // })
        // .always(function(res){
        //     console.log("Response:");
        //     console.log(res);
        // })
        ;
}

// This function will attempt to populate the DOM with the weather data given
function populateWeather(weatherJSON){
    console.log(weatherJSON);
}