/*
 * Thinking: Both Geolocate and GeoIP objects have their own APIs, that return their own properties.
 * Build each object. Try running the Geolocation first.
 * If we have reason to believe it failed, then run GeoIP.
 */

var geocode_properties = {
	latitude: "",
	longitude: "",
	street: "",
	city: "",
	province: "",
	accuracy: 40000,
	altitude: "",
	altitudeAccuracy: "",
	heading: "",
	speed: "",
	locked: false
};

var geoip2_obj = new function() {

	this.error = function(error) {
		$(".loading_message").queue(function() {
			$(this).text("Error getting location. Please refresh your browser.").dequeue();
		});
	};

	this.success = function(position) {

		$(".loading_message").fadeOut("fast").css("display: none");
	    $(".loading_message").queue(function() {
			$(this).text("Approximate location determined. Please wait.").dequeue();
	    });
	    $(".loading_message").fadeIn("fast").css("display: block");

		$(".maxmind_statement").show();

		geocode_properties.latitude = position.location.latitude;
		geocode_properties.longitude = position.location.longitude;
		geocode_properties.city = position.city.names.en;
		geocode_properties.province = position.subdivisions[0].iso_code;

		geocode_properties.locked = true;

		$(".throbber").fadeOut("fast").css("display: none");
	    $(".container").delay("1000").fadeIn("fast").css("display: block");

	};

	this.failure = function (error) {
		$(".loading_message").queue(function() {
			$(this).text("Attempt to get location failed. Please refresh your browser.").dequeue();
		});
	};

	this.options = {
		enableHighAccuracy: true
	};

	this.init = function() {
		
		debug_report(geoip2);
		if (geoip2) { geoip2.city(geoip2_obj.success, geoip2_obj.failure, geoip2_obj.options); }

	};

};

var geolocate_obj = new function() {

	this.error = function(error) {
		$(".loading_message").queue(function() {
			$(this).text("Error getting location. Just a moment.").dequeue();
		});
		geoip2_obj.init();
	};

	this.success = function(position) {

		$(".loading_message").fadeOut("fast").css("display: none");
	    $(".loading_message").queue(function() {
			$(this).text("Location determined. Please wait.").dequeue();
	    });
	    $(".loading_message").fadeIn("fast").css("display: block");

	    geocode_properties.accuracy = position.coords.accuracy;
		geocode_properties.altitude = position.coords.altitude;
		geocode_properties.altitudeAccuracy = position.coords.altitudeAccuracy;
		geocode_properties.heading = position.coords.heading;
		geocode_properties.latitude = position.coords.latitude;
		geocode_properties.longitude = position.coords.longitude;
		geocode_properties.speed = position.coords.speed;

		this.geocode_options = {
			center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
		};
		this.geocoder = new google.maps.Geocoder();
		this.geocoder.geocode({'latLng': this.geocode_options.center}, function(geocoded, status) {
			$(geocoded).each(function() {
				if (this.types[0] == "street_address") {
					geocode_properties.street = this.formatted_address;
				};
				if (this.types[0] == "locality") {
					geocode_properties.city = this.formatted_address;
				};
				if (this.types[0] == "administrative_area_level_1") {
					geocode_properties.province = this.formatted_address;
				};
			});
		});

		geocode_properties.locked = true;

		// $(".throbber").fadeOut("fast").css("display: none");
	    // $(".container").delay("1000").fadeIn("fast").css("display: block");

	    $(".throbber").queue(function() {
	    	$(this).fadeOut("fast");
	    	$(this).css("display: none");
	    	$(this).dequeue();
		});

		$(".container").queue(function() {
	    	$(this).fadeIn("fast");
	    	$(this).css("display: block");
	    	$(this).dequeue();
		});


	};

	this.failure = function (error) {
		$(".loading_message").queue(function() {
			$(this).text("Attempt to get location failed. Just a moment.").dequeue();
		});
		geoip2_obj.init();
	};

	this.options = {
		enableHighAccuracy: true,
		timeout: 3000
	};

	this.init = function() {

		$(".loading_message").queue(function() {
			$(this).text("Determining your location.").dequeue();
	    });
		$(".loading_message").fadeIn("fast").css("display: block");

		// if (navigator.geolocation) {
			// this.location_id = navigator.geolocation.getCurrentPosition(this.success, this.failure, this.options);
		// } else {
			geoip2_obj.init();
		// }
	};

};

geolocate_obj.init();

var wait_for_geolocate = setInterval( function() { 
	
	if (geocode_properties.locked !== true) { 
		geoip2_obj.init(); 
	};
	clearInterval(wait_for_geolocate);

}, 4000);