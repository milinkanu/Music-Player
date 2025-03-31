console.log('Lets write JavaScript');

let currentSong = new Audio();
let playButton = null;
let songs = [];
let currFolder;
const BASE_URL = "https://raw.githubusercontent.com/milinkanu/Music-Player/main/Songs";

async function getSongs(folder) {
    try {
        // Fetch the songs.json file
        let response = await fetch(`${BASE_URL}/songs.json`);
        let albums = await response.json();
        console.log("Albums:", albums); // Debugging

        // Find the album by folder name
        let album = albums.find(album => album.folder === folder);
        if (!album) {
            console.error(`Album not found for folder: ${folder}`);
            return [];
        }

        songs = album.songs.map(song => `${BASE_URL}/${folder}/${song}`);
        console.log("Songs array:", songs); // Debugging

        let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";

        // Populate the song list
        album.songs.forEach(song => {
            let songName = song.replace(".mp3", "").replaceAll("%20", " ");
            songUL.innerHTML += `<li>
                                    <img class="invert" src="img/music.svg" alt="">
                                    <div class="info">
                                        <div>${songName}</div>
                                    </div>
                                    <div class="playnow">
                                        <span>Play Now</span>
                                        <img class="invert" src="img/play.svg" alt="">
                                    </div>
                                </li>`;
        });

        // Attach an event listener to each song
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e, index) => {
            e.addEventListener("click", () => {
                const trackUrl = songs[index]; // Get the correct URL from the songs array
                console.log("Playing track:", trackUrl);
                playMusic(trackUrl); // Pass the full URL to playMusic
            });
        });

        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

const playMusic = (track, pause = false) => {
    // Pause the currently playing song
    currentSong.pause();

    currentSong.src = track;
    if (!pause) {
        currentSong.play().catch((error) => {
            console.error("Error playing audio:", error);
        });
    }
    if (playButton) {
        playButton.src = "img/pause.svg"; // Update the play button icon
    }

    // Extract the song name from the track URL
    let songName = track.includes("/")
    ? track.split("/").pop() // Get the last part of the URL
          .replace("%20-%20PagalWorld.mp3", "")
          .replaceAll("%20", " ")
          .replaceAll("_", "")
          .replace(".mp3", "")
    : "Unknown Song";

    document.querySelector(".songinfo").innerHTML = songName;

    currentSong.addEventListener("loadedmetadata", () => {
        const totalDuration = formatTime(currentSong.duration); // Format the duration
        document.querySelector(".songtime").innerHTML = `00:00 / ${totalDuration}`;
    });

    // Update the current time during playback
    currentSong.addEventListener("timeupdate", () => {
        const currentTime = formatTime(currentSong.currentTime); // Format the current time
        const totalDuration = formatTime(currentSong.duration); // Format the duration
        document.querySelector(".songtime").innerHTML = `${currentTime} / ${totalDuration}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"; // Update progress bar
    });

    // Add an event listener to the seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        document.querySelector(".circle").style.left =
            (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentSong.currentTime =
            (currentSong.duration * (e.offsetX / e.target.getBoundingClientRect().width) * 100) / 100;
    });
};

// Helper function to format time in MM:SS
const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

async function displayAlbums() {
    try {
        // Fetch the songs.json file
        let response = await fetch(`${BASE_URL}/songs.json`);
        let albums = await response.json(); // Parse the JSON response
        console.log("Albums:", albums); // Debugging

        let cardContainer = document.querySelector(".cardContainer");
        console.log("Card Container:", cardContainer); // Debugging

        // Loop through the albums and create cards
        albums.forEach(album => {
            cardContainer.innerHTML += `
                <div data-folder="${album.folder}" class="card">
                    <div class="play">
                        <svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="12" fill="#1bc457" />
                            <path d="M8 5.5l11 6.5a.6.6 0 0 1 0 1L8 19.5a.6.6 0 0 1-.9-.5V6a.6.6 0 0 1 .9-.5z"
                                fill="black" transform="scale(0.8) translate(3,3)" />
                        </svg>
                    </div>
                    <img src="${BASE_URL}/${album.folder}/${album.cover}" alt="">
                    <h2>${album.title}</h2>
                    <p>${album.description}</p>
                </div>`;
        });
    } catch (error) {
        console.error("Error fetching albums:", error);
    }
}

async function main() {
    // Get the list of all the songs
    await getSongs("Milin");
    console.log(songs);
    playMusic(songs[0], true);

    // Display all the albums on the page
    await displayAlbums();

    // Attach an event listener to playBtn
    playButton = document.getElementById("playBtn");
    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play().catch((error) => {
                console.error("Error playing audio:", error);
            });
            playButton.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playButton.src = "img/play.svg";
        }
    });

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    });

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    const previousBtn = document.getElementById("previousBtn");
    const nextBtn = document.getElementById("nextBtn");

    // Add an event listener to previous
    previousBtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Add an event listener to next
    nextBtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg");
        }
    });

    // Add event listener to mute the track
    document.querySelector(".volume> img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }
    });

    // Load the Playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Clicked card folder:", item.currentTarget.dataset.folder); // Debugging

            // Fetch songs for the selected folder
            songs = await getSongs(item.currentTarget.dataset.folder);
            const cleanedSongs = songs.map(song => song.split('/').pop().replaceAll('%20', ' '));
            console.log("Loaded songs:", cleanedSongs); // Debugging

            if (songs.length > 0) {
                // Play the first song in the new playlist
                playMusic(songs[0], false);

                document.querySelector(".circle").style.left = "0%"; // Reset progress bar
            }

            document.querySelector(".left").style.left = 0;
        });
    });
}

main();

