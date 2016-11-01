var locations = [
      {title: 'London Eye', location: {lat: 51.5033, lng: -0.1197}},
      {title: 'Big Ben', location: {lat: 51.500756, lng: -0.124661}},
      {title: 'Tower of London', location: {lat: 51.508056, lng: -0.076111}},
      {title: 'The British Museum', location: {lat: 51.519459, lng: -0.126931}},
      {title: 'The National Gallery', location: {lat: 51.5086, lng: -0.1283}}
    ];
var markers = [];
var wikiArticle = [];

var Marker = function(){
	var self = this;
	//Creating markers with infowindow on map
	for(var i=0;i<locations.length;i++){	
		marker = new google.maps.Marker({
	     	position: locations[i].location,
	      	map: map,
	      	title: locations[i].title
	    });
		marker.addListener('click', function() {
			infowindow.setContent(this.title+"<p>Cords "+this.position+"</p>");
	       	infowindow.open(map, this);
	       	this.setAnimation(google.maps.Animation.BOUNCE);
	    });
		markers.push(marker);
}	
	
	//wikiApi https://www.mediawiki.org/wiki/API:Main_page/pl
	var wikiArticle;
	this.wikiApi = function(s){
	    var wikiUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&search="+s+"&format=json&callback=wikiCallback";
	   
	    var wikiRequestTimeout = setTimeout(function(){
	       wikiArticle = ("Failed to get wikiperdia resources");
	    }, 8000);

	    $.ajax({
	        url: wikiUrl,
	        dataType: "jsonp",
	        success: function (response) {
	            var articleList = response[1];
	            var articleStr;
	            articleStr = articleList[0];
	            var url = response[3][0];
	            //Href to infowindow from menu
	            wikiArticle = ("<a = href='"+url+"'>"+articleStr+"</a>");
				clearTimeout(wikiRequestTimeout);
	        }
	    })
}

  	for(var i=0;i<locations.length;i++){
  	// OpenWeatherApi  http://openweathermap.org/api
  	this.weather;

	$.get("http://api.openweathermap.org/data/2.5/forecast/city?lat="+locations[i].location.lat+"&lon="+locations[i].location.lng+"&APPID=cb6d5ec45fbedcd4e74afc795a69ad08&units=metric",
	function(data) {
		$("#data").text(data); 
		weather = data;
	})
	 .fail(function() {
   		weather = "Tempetature cannot be loaded."
 	 })

	//Listener for menu list
		$("#list"+i).on("click", function (){
			for(var x=0;x<locations.length;x++){
				//Checking for good marker and good info
				if(markers[x].title === $(this).html()){
					self.wikiApi($(this).html());
					var temp = weather.list[0].main.temp;
					var retTemp = Math.floor((9/5*temp+32));
					var title = locations[x].title;
					var lat = locations[x].location.lat;
					var lng = locations[x].location.lng;
					infowindow.setContent("wait...");

					//infowindow have to wait for data from wiki api
					setTimeout(function(){ 
					infowindow.setContent(title+"<p>Cords "+lat+" "+lng+"</p>"+
						"<p>Tempetature: "+temp+"°C /"+retTemp+" °F"+
						"<p>Wiki article: "+ wikiArticle);
					 }, 1000);
		      	 	infowindow.open(map, markers[x]);
				}
			}
		});
  	}
};

var ViewModel = function(){
	var self = this;
	var count = 0;

	//Filter string using knockdown http://knockoutjs.com/
	this.str = ko.observable("");

	//Simple burger menu with jquerry help
	this.burgerMenu = function(){
		if(count === 0){
			$("#menuBurger").css("width", 0);
			$("#mapAndBurger").css("width", "100%");
	  		google.maps.event.trigger(window, 'resize', {});
	  		count++;
		}else if(count !== 0){
			$("#menuBurger").css("width", "20%");
			$("#mapAndBurger").css("width", "80%");
	  		google.maps.event.trigger(window, 'resize', {});
	  		count = 0;
		}
	};

	//Real time list create
    self.worker = ko.computed(function () {
        if (self.str()){
        	self.zoom();
        }else if(self.str() === ""){
        	$("#lista").children().remove();
			for(var i=0; i<locations.length; i++){
				var title = locations[i].title;
				var position = locations[i].location;
				$("#lista").append("<li id='list"+i+"' class='listPlaces'>"+title+"</li>");
			}
        }});

    //Filter list
	this.zoom = function(){
		var search = self.str().toLowerCase();
		for(var i=0; i<locations.length; i++){
			if(search != undefined){
				if(locations[i].title.toLowerCase().indexOf(search) != -1){
				}else{
					$("#list"+i).remove();
				}
			}
		}
	}

	// Google map ini and creating marker
	initMap = function (){
		map = new google.maps.Map(document.getElementById('map'), {
		  center: {lat: 51.5057106, lng: -0.12045},
		  zoom: 14
		});
		infowindow = new google.maps.InfoWindow({
		content: "waiting..."
		});
		var markers = new Marker();
	}

};

ko.applyBindings( new ViewModel() );

// Google Error Handling
googleError = function(){
	alert("Cannot load Google Maps Api check your intenret connection and try again!");
}