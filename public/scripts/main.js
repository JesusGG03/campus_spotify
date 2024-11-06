const AUTH_EXPIRATION_TIME = 10 * 60 * 1000;
let authflag = sessionStorage.getItem('authflag') === 'true';
let authExpiration = parseInt(sessionStorage.getItem('authExpiration')) || 0;
let showingUserData = true;

let loginBtn = document.querySelector('#login-btn')


const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');

let genreChart;


navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active'); // Toggle 'active' class on menu
});


loginBtn.addEventListener('click', function() {
    sessionStorage.setItem('authflag', 'true');
    sessionStorage.setItem('authExpiration', Date.now() + AUTH_EXPIRATION_TIME);
    authflag = true;

    window.location.href = '/login';  
});



function displayTopTracks(topTracks) {

    
    const topSongsTitle = document.querySelector(".user-song-container h1");
    
    topSongsTitle.textContent = "Your Top Songs";

    const flipTrackBtn = document.querySelector('.flipTrackDataBtn');
    flipTrackBtn.style.display = "block"; 

    if (!flipTrackBtn.hasAttribute('data-listener')) {
        flipTrackBtn.addEventListener('click', () => {
            if (showingUserData) {
                console.log('flip track btn pressed');
                console.log(showingUserData)
                getUniTopTracks();  // Fetch university data
            } else {
                console.log('flip track btn pressed');
                console.log(showingUserData)
                getUserTopTracks(); // Fetch user data
            }
            // Flip the state
            showingUserData = !showingUserData;
        });
        flipTrackBtn.setAttribute('data-listener', 'true'); // Mark listener as added
    }

    // Top #1 Song container
    const topSongContainer = document.querySelector('.user-top-song-container');

    if (topTracks.length > 0) {
        const firstTrack = topTracks[0];
        topSongContainer.querySelector('h2').textContent = '1.';
        topSongContainer.querySelector('img').src = firstTrack.album.images[0].url;
        topSongContainer.querySelector('.user-top-song-info h3').textContent = firstTrack.name;
        topSongContainer.querySelector('.user-top-song-info h4').textContent = firstTrack.artists.map(artist => artist.name).join(', ');
    }


    // Positions 2 through 5 in user-top-five-songs-container
    const topFiveContainer = document.querySelector('.user-top-five-songs-container');
    topFiveContainer.innerHTML = ''; // Clear any previous tracks if needed

    topTracks.slice(1, 5).forEach((track, index) => {
        const trackRow = document.createElement('div');
        trackRow.className = 'user-top-five-song-container';

        // Song Position
        const position = document.createElement('h2');
        position.textContent = `${index + 2}.`;

        const songImg = document.createElement('img');
        songImg.src = track.album.images[0].url

        // Track Info
        const trackInfo = document.createElement('div');
        trackInfo.className = 'user-top-five-song-info';

        const trackName = document.createElement('h3');
        trackName.textContent = track.name;

        const trackArtist = document.createElement('h4');
        trackArtist.textContent = track.artists.map(artist => artist.name).join(', ');

        // Append info to trackRow
        trackInfo.appendChild(trackName);
        trackInfo.appendChild(trackArtist);
        trackRow.appendChild(position);
        trackRow.appendChild(songImg);
        trackRow.appendChild(trackInfo);

        // Append trackRow to the container
        topFiveContainer.appendChild(trackRow);
    });

    
}


function displayUniTopTracks(topTracks) {

    const songTitle = document.querySelector(".user-song-container h1");
    
    songTitle.textContent = "Top Songs in Charlotte";

    

    // Top #1 Song container
    const topSongContainer = document.querySelector('.user-top-song-container');
    if (topTracks.length > 0) {
        const firstTrack = topTracks[0];
        topSongContainer.querySelector('h2').textContent = '1.';
        topSongContainer.querySelector('img').src = firstTrack.image_url;
        topSongContainer.querySelector('.user-top-song-info h3').textContent = firstTrack.track_name;
        topSongContainer.querySelector('.user-top-song-info h4').textContent = firstTrack.artist_name;
    }

    // Positions 2 through 5 in user-top-five-songs-container
    const topFiveContainer = document.querySelector('.user-top-five-songs-container');
    topFiveContainer.innerHTML = ''; // Clear any previous tracks if needed

    topTracks.slice(1, 5).forEach((track, index) => {
        const trackRow = document.createElement('div');
        trackRow.className = 'user-top-five-song-container';

        // Song Position
        const position = document.createElement('h2');
        position.textContent = `${index + 2}.`;

        const songImg = document.createElement('img');
        songImg.src = track.image_url

        // Track Info
        const trackInfo = document.createElement('div');
        trackInfo.className = 'user-top-five-song-info';

        const trackName = document.createElement('h3');
        trackName.textContent = track.track_name;

        const trackArtist = document.createElement('h4');
        trackArtist.textContent = track.artist_name;

        // Append info to trackRow
        trackInfo.appendChild(trackName);
        trackInfo.appendChild(trackArtist);
        trackRow.appendChild(position);
        trackRow.appendChild(songImg);
        trackRow.appendChild(trackInfo);

        // Append trackRow to the container
        topFiveContainer.appendChild(trackRow);
    });
}


// Notes: add button to display the Uni data at top corner
function displayTopArtists(topArtists){

    const artistTitle = document.querySelector(".user-artist-container h1");
    
    artistTitle.textContent = "Your Top Artists";

    const flipArtistBtn = document.querySelector('.flipArtistDataBtn');
    flipArtistBtn.style.display = "block"; 

    if (!flipArtistBtn.hasAttribute('data-listener')) {
        flipArtistBtn.addEventListener('click', () => {
            if (showingUserData) {
                getUniTopArtist();  // Fetch university data
            } else {
                getUserTopArtist(); // Fetch user data
            }
            // Flip the state
            showingUserData = !showingUserData;
        });
        flipArtistBtn.setAttribute('data-listener', 'true'); // Mark listener as added
    }

    const topArtistContainer = document.querySelector('.user-top-artist-container');
    if(topArtists.length > 0){
        const firstArtist = topArtists[0];
        topArtistContainer.querySelector('h2').textContent = '1.';
        topArtistContainer.querySelector('img').src = firstArtist.images[0].url;
        topArtistContainer.querySelector('.user-top-artist-info h3').textContent = firstArtist.name;
    }

    const topFiveContainer = document.querySelector('.user-top-five-artists-container');
    topFiveContainer.innerHTML = '';

    topArtists.slice(1,5).forEach((artist, index) => {
        const artistRow = document.createElement('div');
        artistRow.className = 'user-top-five-artist-container';

        const position = document.createElement('h2');
        position.textContent = `${index + 2}.`;

        const artistImg = document.createElement('img');
        artistImg.src = artist.images[0].url;

        const artistInfo = document.createElement('div');
        artistInfo.className = 'user-top-five-artist-info';

        const artistName = document.createElement('h3');
        artistName.textContent = artist.name

        artistInfo.appendChild(artistName);
        artistRow.appendChild(position);
        artistRow.appendChild(artistImg);
        artistRow.appendChild(artistInfo);

        topFiveContainer.appendChild(artistRow)
    });


}


function displayUniTopArtists(topArtists){

    const artistTitle = document.querySelector(".user-artist-container h1");
    
    artistTitle.textContent = "Top Artists in Charlotte";

    const topArtistContainer = document.querySelector('.user-top-artist-container');
    if(topArtists.length > 0){
        const firstArtist = topArtists[0];
        topArtistContainer.querySelector('h2').textContent = '1.';
        topArtistContainer.querySelector('img').src = firstArtist.artist_img;
        topArtistContainer.querySelector('.user-top-artist-info h3').textContent = firstArtist.artist_name;
    }

    const topFiveContainer = document.querySelector('.user-top-five-artists-container');
    topFiveContainer.innerHTML = '';

    topArtists.slice(1,5).forEach((artist, index) => {
        const artistRow = document.createElement('div');
        artistRow.className = 'user-top-five-artist-container';

        const position = document.createElement('h2');
        position.textContent = `${index + 2}.`;

        const artistImg = document.createElement('img');
        artistImg.src = artist.artist_img;

        const artistInfo = document.createElement('div');
        artistInfo.className = 'user-top-five-artist-info';

        const artistName = document.createElement('h3');
        artistName.textContent = artist.artist_name

        artistInfo.appendChild(artistName);
        artistRow.appendChild(position);
        artistRow.appendChild(artistImg);
        artistRow.appendChild(artistInfo);

        topFiveContainer.appendChild(artistRow)
    });


}


function getUserTopTracks() {
    fetch('/user-top-tracks')
        .then(response => response.json())
        .then(data => {
            displayTopTracks(data);
            // You can now use 'data' to display the tracks on the page
            // Example: displayTracks(data);
        })
        .catch(error => console.error('Error fetching top tracks:', error));
}


function getUserTopArtist(){
    fetch('/user-top-artist')
        .then(response => response.json())
        .then(data => {
            displayTopArtists(data);
        })
        .catch(error => console.error('Error fetching top artists', error));
}

function getUniTopTracks(){
    fetch('/get-uni-tracks')
        .then(response => response.json())
        .then(data => {
            displayUniTopTracks(data);
        })
        .catch(error => console.error('Error fetching data: ', error));
}

function getUniTopArtist(){
    fetch('/get-uni-artists')
        .then(response => response.json())
        .then(data => {
            displayUniTopArtists(data);
        })
        .catch(error => console.error('Error fetching top university artists', error));
}


function getUserGenres(){
    fetch('/user-genres')
        .then(response => response.json())
        .then( data => {
            displayUserGenreChart(data);
            
        })
        .catch(error => console.error('Error fetching user genres', error));

}


function getUniGenres() {
    fetch('/get-uni-genres')
        .then(response => response.json())
        .then(data => {
            displayUniGenreChart(data); // Only display after data is fully retrieved
        })
        .catch(error => console.error('Error fetching university genres:', error));
}

function displayUserGenreChart(genreData) {
    const ctx = document.getElementById('genre-pie-chart').getContext('2d');

    const pieChartTitle = document.querySelector('.university-pie-chart h1');
    pieChartTitle.textContent = 'Your Genres';

    const flipGenreBtn = document.querySelector('.flipGenreDataBtn');
    flipGenreBtn.style.display = "block"; 

    if (!flipGenreBtn.hasAttribute('data-listener')) {
        flipGenreBtn.addEventListener('click', () => {
            if (showingUserData) {
                
                getUniGenres();  // Fetch university data
            } else {
                getUserGenres(); // Fetch user data
            }
            // Flip the state
            showingUserData = !showingUserData;
        });
        flipGenreBtn.setAttribute('data-listener', 'true'); // Mark listener as added
    }
    
    if (genreChart) {
        genreChart.destroy();
    }


    const labels = Object.keys(genreData);
    const data = Object.values(genreData);

    genreChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Genre Distribution',
                data: data,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });

    
}


function displayUniGenreChart(genreData) {
    const ctx = document.getElementById('genre-pie-chart').getContext('2d');

    const labels = Object.keys(genreData).length ? Object.keys(genreData) : ["Others"];
    const data = Object.values(genreData).length ? Object.values(genreData) : [1];

    genreChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Genre Distribution',
                data: data,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                ]
            }]
        },
        options: { responsive: true }
    });
}


function displayUniData(){
    getUniGenres();
    getUniTopArtist();
    getUniTopTracks();
}

function displayUserData(){
    getUserGenres();
    getUserTopArtist();
    getUserTopTracks();
}

document.addEventListener("DOMContentLoaded", () => {
    const fadeInElements = document.querySelectorAll('.fade-in');



    // Add a slight delay for a smoother fade-in effect
    fadeInElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('visible');
        }, index * 300); // Adjust the delay as necessary
    });
    
    
    console.log(authflag);

    if (Date.now() > authExpiration) {
        // Auth has expired; reset the flag
        sessionStorage.removeItem('authflag');
        sessionStorage.removeItem('authExpiration');
        authflag = false; // Reset the flag in memory
    }

    if (authflag) {

        const loginbttn = document.getElementById('login-btn');
        loginBtn.remove();

        
        getUserTopTracks();
        getUserTopArtist();
        getUserGenres();

    } else {
        getUniTopTracks();
        getUniTopArtist();
        getUniGenres();
    }


    
});