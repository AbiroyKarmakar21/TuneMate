console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs; // This will hold the list of songs for the *currently* loaded playlist
let currFolder;
let lastVolume = 1.0; // --- FIX: Added to remember volume before mute ---

// This list is now UPDATED with all your playlists and their .mp3 files
const folderSongs = {
    "Kiliye Kiliye": ["Kiliye Kiliye.mp3"],
    "O mere Dil ke": ["O mere dil ke chain.mp3"],
    "Lag ja Gale": ["lag ja gale.mp3"],
    "karan aujla": [
        "For A Reason (Official Video) Karan Aujla  Tania   Ikky  Latest Punjabi Songs 2025 - Rehaan Records.mp3",
        "Wavy Karan Aujla.mp3"
    ],
    "Señorita - Shawn Mendes": ["Señorita - Shawn Mendes.mp3"],
    "Main Rang Sharbaton ka": ["Main Rang Sharbaton ka.mp3"],
    "Teri Deewani": ["Teri Deewani.mp3"],
    // --- NEW PLAYLISTS ADDED ---
    "Itna na mujhse tu pyar badha": ["Itna na mujhse tu pyar badha.mp3"],
    "Sahiba": ["Sahiba.mp3"],
    "Chikni Chameli": ["Chikni Chameli.mp3"],
    "Jalebi Bai": ["Jalebi Bai.mp3"]
};


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    
    // Get the hardcoded song list for the folder
    let folderName = folder.split("/").pop(); 
    songs = folderSongs[folderName] || []; // Update the global 'songs' variable

    if (songs.length === 0) {
        console.warn(`No songs found in hardcoded list for folder: ${folderName}`);
    }
 
    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        // --- UPDATED HTML STRUCTURE ---
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" width="24" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ").replace(".mp3", "")}</div>
                               
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img width="24" class="invert" src="img/play.svg" alt="">
                            </div> 
                        </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // Find the song name from the innerHTML and add .mp3 back
            let trackName = e.querySelector(".info").firstElementChild.innerHTML.trim() + ".mp3";
            playMusic(trackName)
        })
    })

    return songs;
}

const playMusic = (track, pause = false) => {
    // Check if track is undefined
    if (!track) {
        console.error("Track is undefined. Cannot play music.");
        document.querySelector(".songinfo").innerHTML = "Error: No track selected";
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
        play.src = "img/play.svg";
        return; 
    }
    
    // Using relative path
    currentSong.src = `${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track.replace(".mp3", ""))
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
    console.log("displaying albums")
    let cardContainer = document.querySelector(".cardContainer")

    // UPDATED list of all your folders
    let folders = [
        "Kiliye Kiliye", 
        "O mere Dil ke", 
        "Lag ja Gale", 
        "karan aujla", 
        "Señorita - Shawn Mendes", 
        "Main Rang Sharbaton ka", 
        "Teri Deewani",
        // --- NEW FOLDERS ADDED ---
        "Itna na mujhse tu pyar badha",
        "Sahiba",
        "Chikni Chameli",
        "Jalebi Bai"
    ];

    // Loop through the array
    for (const folder of folders) { 
        // Get the metadata of the folder
        try {
            // Using relative path
            let a = await fetch(`songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                            stroke-linejoin="round" />
                    </svg>
                </div>

                <img src="songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
        } catch (error) {
            console.error(`Could not load info.json for folder: ${folder}`, error);
        }
    }


    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            // Pass the relative path to getSongs
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            
            // Add a check here: only play music if songs were found
            if (songs.length > 0) {
                playMusic(songs[0])
            } else {
                console.warn("No songs to play for this album.");
                // Optionally clear the playbar
                document.querySelector(".songinfo").innerHTML = "No songs found for this album"
                document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
                play.src = "img/play.svg"
            }

        })
    })
}

async function main() {
    // Get the list of all the songs
    // UPDATED to load your first playlist by default
    await getSongs("songs/Kiliye Kiliye")
    // Play the first song (if it exists) but keep it paused
    if (songs.length > 0) {
        playMusic(songs[0], true)
    } else {
        console.warn("No initial songs found in 'Kiliye Kiliye' folder.");
        playMusic(undefined, true); // This will show the error state gracefully
    }

    // Display all the albums on the page
    await displayAlbums()


    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (!currentSong.src || currentSong.src.endsWith("/")) { // Check if src is empty or just the base path
            console.warn("No song loaded.");
            // Optionally play the first song of the current list
            if (songs && songs.length > 0) {
                playMusic(songs[0]);
            }
            return;
        }
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        if (currentSong.duration) {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentSong.currentTime = ((currentSong.duration) * percent) / 100
        }
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // --- FIX: PREVIOUS BUTTON LOGIC ---
    previous.addEventListener("click", () => {
        if (!currentSong.src || !songs || songs.length === 0) return;
        currentSong.pause()
        console.log("Previous clicked")

        // Decode the track name from the full URL source
        let currentTrack = decodeURI(currentSong.src.split("/").pop())
        let index = songs.indexOf(currentTrack)

        if (index === -1) {
             console.warn("Could not find current song in list:", currentTrack);
             playMusic(songs[0]); // Fallback to first song
             return;
        }
        
        if ((index - 1) < 0) {
            // If at the beginning, loop to the end
            playMusic(songs[songs.length - 1]) 
        } else {
            playMusic(songs[index - 1])
        }
    })

    // --- FIX: NEXT BUTTON LOGIC ---
    next.addEventListener("click", () => {
        if (!currentSong.src || !songs || songs.length === 0) return;
        currentSong.pause()
        console.log("Next clicked")

        // Decode the track name from the full URL source
        let currentTrack = decodeURI(currentSong.src.split("/").pop())
        let index = songs.indexOf(currentTrack)

        if (index === -1) {
             console.warn("Could not find current song in list:", currentTrack);
             playMusic(songs[0]); // Fallback to first song
             return;
        }

        if ((index + 1) >= songs.length) {
            // If at the end, loop to the beginning
            playMusic(songs[0])
        } else {
            playMusic(songs[index + 1])
        }
    })

    // --- FIX: VOLUME SLIDER (use 'input' for real-time update) ---
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
        let newVolume = parseInt(e.target.value) / 100;
        console.log("Setting volume to", e.target.value, "/ 100") 
        currentSong.volume = newVolume;
        
        // Also update the mute icon
        if (newVolume === 0) {
            document.querySelector(".volume>img").src = "img/mute.svg";
        } else {
            document.querySelector(".volume>img").src = "img/volume.svg";
        }
    })

    // --- FIX: MUTE BUTTON (remembers last volume) ---
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(currentSong.volume > 0){
            // MUTE
            lastVolume = currentSong.volume; // Store the current volume
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            // UNMUTE
            // Restore to the last volume (or 1.0 if lastVolume was 0)
            let restoreVolume = lastVolume > 0 ? lastVolume : 1.0;
            e.target.src = "img/volume.svg";
            currentSong.volume = restoreVolume;
            document.querySelector(".range").getElementsByTagName("input")[0].value = restoreVolume * 100;
        }

    })

}

main()