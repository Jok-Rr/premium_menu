function getCoordinates() {
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

function CardCreate(lat, lng, averageRating, NameRestaurant, adressRestaurant, ratingArr) {

    const mainDiv = document.createElement('div');
    const card = document.createElement('div')
    const ratingDiv = document.createElement('div');
    const starDiv = document.createElement('div')
    const ratingBox = document.createElement('div')
    const streetFigure = document.createElement('figure')
    const streetView = document.createElement('img');
    const restaurantName = document.createElement('p');
    const avgRating = document.createElement('p');
    const lenghtRating = document.createElement('p');
    const moreRating = document.createElement('p');
    const adresseRestaurant = document.createElement('p');
    const ratingTitle = document.createElement('h3')
    const progressStar = document.createElement('progress')
    const svgStar = '<svg><use xlink:href="#fivestars"/></svg>';


    streetView.src = `https://maps.googleapis.com/maps/api/streetview?location=${lat},${lng}&size=456x456&key=AIzaSyAcHaCIT_07d7i5DFKlnTm2gpkmGILxy8E`;
    streetFigure.classList.add('mr-small');
    card.classList.add("card");
    ratingDiv.classList.add("rating-score");
    starDiv.classList.add('rating');
    ratingBox.classList.add('rating-box')
    progressStar.classList.add('rating-bg');
    lenghtRating.classList.add('mr-small')
    moreRating.className = 'toggle-rating-btn txt-bold';
    progressStar.setAttribute('value', averageRating);
    progressStar.setAttribute('max', '5');
    restaurantName.classList.add('txt-bold');

    ratingTitle.textContent = 'Tout les commentaires :'
    restaurantName.textContent = NameRestaurant;
    avgRating.textContent = averageRating;
    lenghtRating.textContent = `(${ratingArr})`;
    moreRating.textContent = 'Voir les avis';
    adresseRestaurant.textContent = adressRestaurant;

    streetFigure.appendChild(streetView);
    card.appendChild(streetFigure);
    card.appendChild(mainDiv);
    mainDiv.appendChild(restaurantName);
    mainDiv.appendChild(ratingDiv);
    mainDiv.appendChild(adresseRestaurant);
    mainDiv.appendChild(ratingBox);
    ratingDiv.appendChild(avgRating);
    ratingDiv.appendChild(starDiv);
    ratingDiv.appendChild(lenghtRating);
    ratingDiv.appendChild(moreRating);
    starDiv.appendChild(progressStar);
    ratingBox.appendChild(ratingTitle);
    starDiv.innerHTML += svgStar;

    return card;
}

function initMap(coordinates) {

    var currLoc = {
        lat: coordinates[0],
        lon: coordinates[1]
    }
    var zoom = 11.5

    const listContainer = document.getElementById('card-container');
    const btnFilter = document.getElementById('btn-filter');
    const maxRating = document.getElementById('max-rating');
    const minRating = document.getElementById('min-rating');

    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: zoom,
        minZoom: zoom - 1,
        maxZoom: zoom + 10,
        center: { lat: currLoc.lat, lng: currLoc.lon },
    });

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
        radius: 20 * 1000 // 10km
    });

    fetch("assets/js/data.json")
        .then(res => res.json())
        .then(data => {

            ArrAllMarker = [];

            const markers = data.map((position, i) => {

                const Latlng = {
                    lat: data[i].lat,
                    lng: data[i].lng
                }

                const marker = new google.maps.Marker({
                    position
                });

                if (google.maps.geometry.spherical.computeDistanceBetween(Latlng, cityCircle.getCenter()) <= cityCircle.getRadius()) {


                    var ratingStar = [];

                    data[i].ratings.forEach(element => {
                        ratingStar.push(element.stars);
                    });

                    Object.assign(position, { avgRating: avg(ratingStar).toFixed(1) });

                    ArrAllMarker.push(position);

                    var card = CardCreate(Latlng.lat, Latlng.lng, avg(ratingStar).toFixed(1), data[i].restaurantName, data[i].address, data[i].ratings.length);

                    var ratingBox = card.querySelector('.rating-box');
                    var moreRating = card.querySelector('.toggle-rating-btn');

                    data[i].ratings.forEach(element => {
                        const rateContent = `<div class="mt-small">
                            <div class="rating-score">
                                <div class="rating mr-small">
                                    <progress class="rating-bg" value="${element.stars}" max="5"></progress>
                                    <svg><use xlink:href="#fivestars"></use></svg>
                                </div>
                                <p>${element.stars} étoiles sur 5</p>
                            </div>
                            <p>${element.comment}</p>
                        </div>`;

                        ratingBox.innerHTML += rateContent
                    });


                    const cardMap = card.cloneNode(true);

                    listContainer.appendChild(card);

                    const infowindow = new google.maps.InfoWindow({
                        content: cardMap,
                    });

                    marker.addListener("click", () => {
                        infowindow.open({
                            anchor: marker,
                            map,
                            shouldFocus: false,
                        });
                    });

                    moreRating.addEventListener('click', () => {
                        ratingBox.classList.toggle('open')

                    });

                }
                return marker
            });

            const _markerClusterer = new markerClusterer.MarkerClusterer({ markers, map });

            btnFilter.addEventListener('click', (e) => {
                e.preventDefault();
                var restaurantFilter = [];

                _markerClusterer.clearMarkers();
                listContainer.innerHTML = '';

                ArrAllMarker.map((position, i) => {
                    if (position.avgRating >= minRating.value && position.avgRating <= maxRating.value) {
                        var marker = new google.maps.Marker({ position: { lat: position.lat, lng: position.lng } });
                        var ratingStar = [];

                        position.ratings.forEach(element => {
                            ratingStar.push(element.stars);
                        });


                        var card = CardCreate(position.lat, position.lng, avg(ratingStar).toFixed(1), position.restaurantName, position.address, position.ratings.length);

                        console.log(card);

                        var ratingBox = card.querySelector('.rating-box');
                        var moreRating = card.querySelector('.toggle-rating-btn');

                        position.ratings.forEach(element => {
                            const rateContent = `<div class="mt-small">
                                <div class="rating-score">
                                    <div class="rating mr-small">
                                        <progress class="rating-bg" value="${element.stars}" max="5"></progress>
                                        <svg><use xlink:href="#fivestars"></use></svg>
                                    </div>
                                    <p>${element.stars} étoiles sur 5</p>
                                </div>
                                <p>${element.comment}</p>
                            </div>`;

                            ratingBox.innerHTML += rateContent
                        });


                        const cardMap = card.cloneNode(true);

                        listContainer.appendChild(card);

                        const infowindow = new google.maps.InfoWindow({
                            content: cardMap,
                        });

                        marker.addListener("click", () => {
                            infowindow.open({
                                anchor: marker,
                                map,
                                shouldFocus: false,
                            });
                        });

                        moreRating.addEventListener('click', () => {
                            ratingBox.classList.toggle('open')

                        });

                        restaurantFilter.push(marker)
                    }
                });

                _markerClusterer.addMarkers(restaurantFilter);
            });
        })

}

