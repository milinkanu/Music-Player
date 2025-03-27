console.log('Lets write JavaScript');

let currentSong = new Audio();
let playButton = null;
let songs = [];
let currFolder;

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`songs/${currFolder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href && element.href.endsWith(".mp3")) {
            let fileName = element.href.split(`/${currFolder}/`)[1]; // Extract the filename
            let songName = fileName.split("%20-%20")[0]; // Extract the part before " - "
            songs.push(element.href);
            if (element.href.endsWith("%20-%20PagalWorld.mp3")) {
                songUL.innerHTML += `<li>
                                    <img class="invert" src="img/music.svg" alt="">
                                    <div class="info">
                                        <div>${(element.href.split(`/${currFolder}/`)[1]).replace("%20-%20PagalWorld.mp3", "").replaceAll("%20", " ")}</div>
                                        <div>${((element.href.split("%20-%20")[1]).split(".mp3")[0]).replaceAll("%20", " ")}</div>
                                    </div>
                                    <div class="playnow">
                                        <span>Play Now</span>
                                        <img class="invert" src="img/play.svg" alt="">
                                    </div>
                                </li>`;
            }
            // /songs/Spotify/Ek%20Toh%20Kum%20Zindagani%20(From%20_Marjaavaan_)%20-%20Neha%20Kakkar.mp3
            else{
                let fileName = element.href.split(`/${currFolder}/`)[1]; // Extract the filename
                let nameElement = element.getElementsByClassName("name")[0];
                let songName = nameElement ? nameElement.innerHTML.replace(".mp3", "") : "Unknown"; 
                if(songName.includes("(From")){
                    songName = songName.split("(From")[0]
                }
                if(songName.includes("_")){
                    songName = songName.replaceAll("_", "")
                }
                let singerName = fileName.split("%20-%20")[1]
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

    for (const song of songs) {
        

    }
    //http://127.0.0.1:5500/songs/Ahista%20Ahista%20-%20PagalWorld.mp3

    // Attach an event Listner to each song
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
    // Pause the currently playing song
    currentSong.pause();

    currentSong.src = track
    if(!pause){
    currentSong.play().catch((error) => {
        console.error("Error playing audio:", error);
    });}
    if (playButton) {
        playButton.src = "img/pause.svg"; // Update the play button icon
    }
    document.querySelector(".songinfo").innerHTML = `${(track.split(`/${currFolder}/`)[1]).replace("%20-%20PagalWorld.mp3", "").replaceAll("%20", " ").replaceAll("_", "").replace(".mp3", "")}`

    currentSong.addEventListener("loadedmetadata", () => {
        const totalDuration = formatTime(currentSong.duration); // Format the duration
        document.querySelector(".songtime").innerHTML = `00:00 / ${totalDuration}`;
    });

    // Update the current time during playback
    currentSong.addEventListener("timeupdate", () => {
        const currentTime = formatTime(currentSong.currentTime); // Format the current time
        const totalDuration = formatTime(currentSong.duration); // Format the duration
        document.querySelector(".songtime").innerHTML = `${currentTime} / ${totalDuration}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"; // circle aage badega song ke saath
    });

    // Add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e =>{
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width)*100 + "%";
        currentSong.currentTime = (currentSong.duration * (e.offsetX / e.target.getBoundingClientRect().width)*100)/100;
    } )

    return songs;
}

// Helper function to format time in MM:SS
const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    console.log("Anchors:", anchors); // Debugging

    let cardContainer = document.querySelector(".cardContainer");
    console.log("Card Container:", cardContainer); // Debugging

    for (const e of anchors) {
        // Ensure it's not the root /songs/ URL and extract the folder name
        if (e.href.includes("/songs/") && !e.href.endsWith("/songs/")) {
            let folder = e.href.split("/").filter(part => part !== "").slice(-1)[0]; // Extract the last non-empty part
            console.log("Folder:", folder); // Debugging

            try {
                let url = `http://127.0.0.1:5500/songs/${folder}/info.json`;
                console.log("Fetching URL:", url); // Debugging
                let a = await fetch(url);
                let response = await a.json();
                console.log("Info JSON Response:", response); // Debugging

                cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                            <div class="play">
                                <svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="12" fill="#1bc457" />
                                    <path d="M8 5.5l11 6.5a.6.6 0 0 1 0 1L8 19.5a.6.6 0 0 1-.9-.5V6a.6.6 0 0 1 .9-.5z"
                                        fill="black" transform="scale(0.8) translate(3,3)" />
                                </svg>
                            </div>
                            <img src="/songs/${folder}/cover.jpg" alt="">
                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>`;
            } catch (error) {
                console.error(`Error fetching info.json for folder: ${folder}`, error);
            }
        }
    }
}

async function main() {
    // Get the list of all the songs
    await getSongs("Milin");
    console.log(songs);
    playMusic(songs[0], true)

    //Display all the albums on the page
    await displayAlbums()

    //Attach an event listner to playBtn
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

    // Add an event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = 0
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    const previousBtn = document.getElementById("previousBtn");
    const nextBtn = document.getElementById("nextBtn");

    //Add an event listner to previous
    previousBtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src)
        if ((index-1) >= 0) { 
            playMusic(songs[index-1])
        }
        
    })
    //Add an event listner to next
    nextBtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src)
        if ((index+1) < songs.length) { 
            playMusic(songs[index+1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg")
        }
    })

    // Add event listner to mute the track
    document.querySelector(".volume> img").addEventListener("click", e=>{
        if(e.target.src.includes("img/volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20
        }
    })

    // Load the Playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Clicked card folder:", item.currentTarget.dataset.folder); // Debugging

            // Fetch songs for the selected folder
            songs = await getSongs(item.currentTarget.dataset.folder);
            console.log("Loaded songs:", songs); // Debugging

            if (songs.length > 0) {
                // Play the first song in the new playlist
                playMusic(songs[0], false);

                document.querySelector(".circle").style.left = "0%"; // Reset progress bar
            }

            document.querySelector(".left").style.left = 0
        });
    });

    for (const e of document.getElementsByClassName("card")) {
        e.addEventListener("click", async (item) => {
            console.log("Clicked card folder:", item.currentTarget.dataset.folder);
            songs = await getSongs(`${item.currentTarget.dataset.folder}`);
            console.log("Loaded songs:", songs); // Debugging
            document.querySelector(".circle").style.left = "0%" 
        });
    }

}

main()

