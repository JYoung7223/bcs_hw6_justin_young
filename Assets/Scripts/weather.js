/***** Local Variables *****/
let lastSearch = "";
const weatherAPIKey = "a115d20ebd38d51609412e1e1556337d";
const currentWeatherAPIEndpoint = "https://api.openweathermap.org/data/2.5/weather?appid=" + weatherAPIKey + "&units=imperial";
const uvIndexWeatherAPIEndpoint = "https://api.openweathermap.org/data/2.5/uvi?appid=" + weatherAPIKey;
const geoForecastWeatherAPIEndpoint = "https://api.openweathermap.org/data/2.5/onecall?appid=" + weatherAPIKey + "&units=imperial&exclude=minutely,hourly,alerts"
const iconEndpoint = "http://openweathermap.org/img/wn/";

/***** DOM elements *****/
var searchHistoryEl = $("#search-history");
var searchEl = $("#search");

var cityNameEl = $("#city-name");
var day0El = $("#day-0");
var day0IconEl = $("#day-0-icon");
var day0TempEl = $("#day-0-temp");
var day0HumidityEl = $("#day-0-humidity");
var day0WindEl = $("#day-0-wind");
var day0UVIndexEl = $("#day-0-uv-index");

var forecastEl = $("#forecast");

/***** Event Listeners *****/
$("#search-form").on("submit", requestedWeather);
$("#search-history").on("click", requestedWeather);

/***** Helper Functions *****/
// This function will handle submitting weather search request
function requestedWeather(event) {
    event.preventDefault();
    // New Search or Repeat
    var targetId = event.target.id;
    if (targetId === "search-form"){
        // New Search
        lastSearch = searchEl[0].value;
        if (lastSearch.trim().length < 1) {
            alert("Must enter a city to search");
            return;
        }
        retrieveWeather(lastSearch);
        searchEl.val("");
    } else {
        // Repeat
        lastSearch = $(event.target).attr("data-city");
        retrieveWeather(lastSearch);
    }
}

// This function will attempt to get the weather data for the given city
function retrieveWeather(city) {
    console.log("Getting Weather For:" + city);
    // Get Today's weather
    $.ajax({
        url: currentWeatherAPIEndpoint + "&q=" + city,
        method: "GET"
    })
        .then(populateWeather)
        .fail(function(errorResponse){
            alert(errorResponse.responseJSON.message);
        });
}

// This function will add the given city to the search history
function addToSearchHistory(city) {
    var searchedCityEl = $("<div>");
    searchedCityEl.addClass("btn form-control text-left bg-white text-secondary border-secondary");
    searchedCityEl.attr("data-city", city);
    searchedCityEl.html(city);
    searchHistoryEl.prepend(searchedCityEl);

    // Add to localStorage
    localStorage.setItem("lastSearchedCity",lastSearch);
}

// This function will attempt to populate the current weather section with the json data given
// It will then use the latitude & longitude from the JSON data to get more detail data (UV Index) and forecast
function populateWeather(todayWeatherJSON) {
    console.log(todayWeatherJSON);
    cityNameEl.html(todayWeatherJSON.name);
    day0El.html("(" + moment.unix(todayWeatherJSON.dt).format('MM/DD/YYYY') + ")");
    day0IconEl.attr("src",iconEndpoint+todayWeatherJSON.weather[0].icon+".png");
    day0IconEl.attr("data-original-title",todayWeatherJSON.weather[0].description);
    day0IconEl.tooltip();
    day0TempEl.html(todayWeatherJSON.main.temp + " °F (" + todayWeatherJSON.main.temp_min + " °F / " + todayWeatherJSON.main.temp_max + " °F)");
    day0HumidityEl.html(todayWeatherJSON.main.humidity + "%");
    day0WindEl.html(todayWeatherJSON.wind.speed + " MPH heading " + todayWeatherJSON.wind.deg + "° from N");

    // Get Today's UV Index using lat={lat}&lon={lon}
    $.ajax({
        url: uvIndexWeatherAPIEndpoint + "&lat=" + todayWeatherJSON.coord.lat + "&lon=" + todayWeatherJSON.coord.lon,
        method: "GET"
    })
        .then(populateUVIndex);

    // Get Forecast using lat={lat}&lon={lon}
    $.ajax({
        url: geoForecastWeatherAPIEndpoint + "&lat=" + todayWeatherJSON.coord.lat + "&lon=" + todayWeatherJSON.coord.lon,
        method: "GET"
    })
        .then(populateForecast);

    // Populate searchHistory
    addToSearchHistory(lastSearch);
}

// This function will populate the DOM with the UV Index JSON response data
function populateUVIndex(uvIndexJSON) {
    day0UVIndexEl.removeClass();
    day0UVIndexEl.html(uvIndexJSON.value);
    switch (parseInt(uvIndexJSON.value)) {
        case 0:
        case 1:
        case 2:
            day0UVIndexEl.addClass("bg-green rounded text-white p-1");
            break;
        case 3:
        case 4:
        case 5:
            day0UVIndexEl.addClass("bg-yellow rounded text-dark p-1");
            break;
        case 6:
        case 7:
            day0UVIndexEl.addClass("bg-orange rounded text-white p-1");
            break;
        case 8:
        case 9:
        case 10:
            day0UVIndexEl.addClass("bg-red rounded text-dark p-1");
            break;
        default:
            day0UVIndexEl.addClass("bg-purple rounded text-white p-1");
            break;
    }
}

// This function will take the json response for getting the forecast and populate the DOM
function populateForecast(forecastJSON) {
    // Clear DOM Forecast
    forecastEl.empty();
    // Populate each day forecast
    for(var i=1; i<6; i++){
        var forecastColumnEl = $("<div>");
        forecastColumnEl.addClass("bg-primary rounded col-sm-4 col-md p-2 m-2");

        var forecastDayEl = $("<p>");
        forecastDayEl.html(moment.unix(forecastJSON.daily[i].dt).format('MM/DD/YYYY'));

        var forecastIconEl = $("<img>");
        forecastIconEl.attr("src",iconEndpoint+forecastJSON.daily[i].weather[0].icon+".png");
        forecastIconEl.attr("data-original-title",forecastJSON.daily[i].weather[0].description);
        forecastIconEl.tooltip();

        var forecastTempEl = $("<p>");
        forecastTempEl.html("Temp: "+forecastJSON.daily[i].temp.day+ " °F");

        var forecastHumidityEl = $("<p>");
        forecastHumidityEl.html("Humidity: "+forecastJSON.daily[i].humidity+"%");

        // Add To DOM
        forecastColumnEl.append(forecastDayEl, forecastIconEl, forecastTempEl, forecastHumidityEl);
        forecastEl.append(forecastColumnEl);
    }
}

// This function will try to populate the DOM with the lastSearchedCity stored in localStorage
function populateLastSearch(){
    lastSearch = localStorage.getItem("lastSearchedCity");
    if(lastSearch === null){
        lastSearch = "";
        return;
    }
    retrieveWeather(lastSearch);
}

populateLastSearch();