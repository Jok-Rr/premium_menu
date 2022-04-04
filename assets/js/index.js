function getCoordintes() {
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        var crd = pos.coords;
        var lat = crd.latitude;
        var lng = crd.longitude;
        var coordinates = [lat, lng];
        console.log(`Latitude: ${lat}, Longitude: ${lng}`);
        initMap(coordinates);
        return;
    }

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
}

function avg(arr) {
    var sum = 0;

    arr.forEach(function (item) {
        sum += item;
    });

    let avg = sum / arr.length;

    return avg;
}

function initMap(coordinates) {

    var currLoc = {
        lat: coordinates[0],
        lon: coordinates[1]
    }
    var zoom = 11.5
    const listContainer = document.getElementById('list_container');

    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: zoom,
        minZoom: zoom,
        maxZoom: zoom + 10,
        center: { lat: currLoc.lat, lng: currLoc.lon },
    });

    const infoWindow = new google.maps.InfoWindow({
        content: "",
        disableAutoPan: true,
    });

    const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const iconCurrLoc = {
        url: 'https://svgshare.com/i/fou.svg',
        size: new google.maps.Size(20, 20),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(10, 10),
        scaledSize: new google.maps.Size(20, 20)
    }

    var markerCurr = new google.maps.Marker({
        position: new google.maps.LatLng(currLoc.lat, currLoc.lon),
        map: map,
        title: "Votre position ",
        icon: iconCurrLoc
    });

    const cityCircle = new google.maps.Circle({
        strokeColor: "#5491F5",
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: "#5491F5",
        fillOpacity: 0.10,
        map,
        center: { lat: currLoc.lat, lng: currLoc.lon },
        radius: 15 * 1000 // 10km
    });

    fetch("assets/js/data.json")
        .then(res => res.json())
        .then(data => {

            const markers = data.map((position, i) => {

                const restaurantName = data[i].restaurantName
                const Latlng = {
                    lat: data[i].lat,
                    lng: data[i].lng
                }
                const checkInArea = google.maps.geometry.spherical.computeDistanceBetween(Latlng, cityCircle.getCenter()) <= cityCircle.getRadius()

                const marker = new google.maps.Marker({
                    position
                });

                if (checkInArea) {

                    var rating = [];

                    data[i].ratings.forEach(element => {
                        rating.push(element.stars);
                    });



                    var InjectData = `
                <div class="restaurant-${data[i].restaurantName} card" > 
                    <p>${data[i].restaurantName}</p>
                    <div class="rating-score">
                    <p>${avg(rating).toFixed(1)}</p>
                        <div class="rating">
                            <progress class="rating-bg" value="${avg(rating).toFixed(1)}" max="5"></progress>
                            <svg><use xlink:href="#fivestars"/></svg>
                        </div>
                        <p>(${data[i].ratings.length})</p>
                    </div>
                        <p>${data[i].address}</p>
                </div>
            `;

                    listContainer.innerHTML += InjectData;
                    marker.addListener("click", () => {
                        infoWindow.setContent(restaurantName);
                        infoWindow.open(map, marker);
                    });
                }


                return marker;
            });

            new markerClusterer.MarkerClusterer({ map, markers });
        })

}

