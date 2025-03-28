console.log('Lets write JavaScript');

const BASE_URL = "https://raw.githubusercontent.com/milinkanu/Music-Player/main/Songs";

let currentSong = new Audio();
let playButton = null;
let songs = [];
let currFolder;

async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`https://api.github.com/repos/milinkanu/Music-Player/contents/Songs/${currFolder}`);
    let data = await response.json();
    
    songs = [];
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

    for (const file of data) {
        if (file.name.endsWith(".mp3")) {
            let fileName = file.name.split(`/${currFolder}/`)[1]; // Extract the filename
            let songName = fileName.split("%20-%20")[0]; // Extract the part before " - "
            songs.push(file.download_url);
            if (file.name.endsWith("%20-%20PagalWorld.mp3")) {
                songUL.innerHTML += `<li>
                                        <img class="invert" src="img/music.svg" alt="">
                                        <div class="info">
                                            <div>${file.name.replace("%20-%20PagalWorld.mp3", "").replaceAll("%20", " ")}</div>
                                            <div>${((file.name.split("%20-%20")[1]).split(".mp3")[0]).replaceAll("%20", " ")}</div>
                                        </div>
                                        <div class="playnow">
                                            <span>Play Now</span>
                                            <img class="invert" src="img/play.svg" alt="">
                                        </div>
                                    </li>`;
            } else {
                let nameElement = file.name;
                let songName = nameElement ? nameElement.replace(".mp3", "") : "Unknown"; 
                if(songName.includes("(From")){
                    songName = songName.split("(From")[0];
                }
                if(songName.includes("_")){
                    songName = songName.replaceAll("_", "");
                }
                let singerName = fileName.split("%20-%20")[1];
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
            }
        }
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            const trackUrl = songs[index]; // Get the correct URL from the songs array
            console.log("Playing track:", trackUrl);
            playMusic(trackUrl); // Pass the full URL to playMusic
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
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
    document.querySelector(".songinfo").innerHTML = `${track.split(`/${currFolder}/`)[1]
        .replace("%20-%20PagalWorld.mp3", "")
        .replaceAll("%20", " ")
        .replaceAll("_", "")
        .replace(".mp3", "")}`;

    currentSong.addEventListener("loadedmetadata", () => {
        const totalDuration = formatTime(currentSong.duration); // Format the duration
        document.querySelector(".songtime").innerHTML = `00:00 / ${totalDuration}`;
    });

    currentSong.addEventListener("timeupdate", () => {
        const currentTime = formatTime(currentSong.currentTime); // Format the current time
        const totalDuration = formatTime(currentSong.duration); // Format the duration
        document.querySelector(".songtime").innerHTML = `${currentTime} / ${totalDuration}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%"; // Update progress bar
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        document.querySelector(".circle").style.left =
            (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentSong.currentTime =
            (currentSong.duration * (e.offsetX / e.target.getBoundingClientRect().width) * 100) / 100;
    });

    return songs;
};

// Helper function to format time in MM:SS
const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

async function displayAlbums() {
    let response = await fetch(`https://api.github.com/repos/milinkanu/Music-Player/contents/Songs`);
    let data = await response.json();
    
    let cardContainer = document.querySelector(".cardContainer");

    for (const folder of data) {
        if (folder.type === "dir") {
            let folderName = folder.name;
            try {
                let url = `${BASE_URL}/${folderName}/info.json`;
                let response = await fetch(url);
                let info = await response.json();

                cardContainer.innerHTML += `<div data-folder="${folderName}" class="card">
                            <div class="play">
                                <svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="12" fill="#1bc457" />
                                    <path d="M8 5.5l11 6.5a.6.6 0 0 1 0 1L8 19.5a.6.6 0 0 1-.9-.5V6a.6.6 0 0 1 .9-.5z"
                                        fill="black" transform="scale(0.8) translate(3,3)" />
                                </svg>
                            </div>
                            <img src="${BASE_URL}/${folderName}/cover.jpg" alt="">
                            <h2>${info.title}</h2>
                            <p>${info.description}</p>
                        </div>`;
            } catch (error) {
                console.error(`Error fetching info.json for folder: ${folderName}`, error);
            }
        }
    }
}

async function main() {
    await getSongs("Milin");
    console.log(songs);
    playMusic(songs[0], true)

    await displayAlbums()

    playButton = document.getElementById("playBtn");
    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play().catch((error) => {
                console.error("Error playing audio:", error);
            });
            playButton.src = "img/pause.svg"
        } else {
            currentSong.pause();
            playButton.src = "img/play.svg"
        }
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    });

    const previousBtn = document.getElementById("previousBtn");
    const nextBtn = document.getElementById("nextBtn");

    previousBtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src)
        if ((index - 1) >= 0) { 
            playMusic(songs[index - 1])
        }
    });

    nextBtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src)
        if ((index + 1) < songs.length) { 
            playMusic(songs[index + 1])
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg")
        }
    });

    document.querySelector(".volume> img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20
        }
    });

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(item.currentTarget.dataset.folder);
            if (songs.length > 0) {
                playMusic(songs[0], false);
                document.querySelector(".circle").style.left = "0%";
            }
            document.querySelector(".left").style.left = 0
        });
    });

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`);
            document.querySelector(".circle").style.left = "0%" 
        });
    });
}

main();
