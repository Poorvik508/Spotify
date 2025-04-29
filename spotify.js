let currentsong = new Audio();
let songs;
let currfolder;
function convertSecondsToTime(seconds) {
    const minutes = Math.floor(seconds / 60);
  
  // Calculate remaining seconds, rounding to the nearest integer
  const remainingSeconds = Math.round(seconds % 60);
  
  // Format minutes and seconds as two digits
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
  
  return `${formattedMinutes}:${formattedSeconds}`
  }
async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
 songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            const song = element.href.split(`/${folder}/`)[1];
            if (song) {  // Check if the song is defined
                songs.push(song);
            }
        }
    }
     // Debugging to ensure you're getting the correct list of songs
     let songul = document.querySelector(".songslist").getElementsByTagName("ul")[0];
    songul.innerHTML = ""
    
    for (const song of songs) {
        if (song) {
            songul.innerHTML += `
                <li>
                    <img class="invert" src="img/music.svg" alt="music">
                    <div class="info">
                        <div>${song.replaceAll("%20", "  ")}</div>
                        <div>Honey singh</div>
                    </div>
                    <div class="playnow">
                        <span>Playnow</span>
                        <img class="invert" src="img/play.svg" alt="play">
                    </div>
                </li>`;
        }
    }

    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            // Get only the song name from the first div of the ".info" div, not the entire textContent
            const trackName = e.querySelector(".info div").textContent.trim();  // Extract song name
         
            
            // Ensure track name is decoded properly if it includes any encoded spaces
            playMusic(decodeURIComponent(trackName));  // Play the selected track
        });
    });
}

const playMusic = (track, paused = false) => {
    const audioPath = `/${currfolder}/` + decodeURIComponent(track);  // Ensure path is decoded
   
    // Ensure currentsong is initialized and is an HTMLAudioElement
    if (!currentsong) {
        currentsong = new Audio();  // Initialize the audio element if it's not already defined
    }

    // If there is already an audio playing, stop it before playing a new one
    if (!currentsong.paused) {
        currentsong.pause();
        currentsong.currentTime = 0;  // Reset to the start
    }

    currentsong.src = audioPath;
    currentsong.load();  // Ensure the audio file is loaded

    currentsong.oncanplaythrough = function () {
      
        if (!paused) {
            play.src = "img/pause.svg";
            currentsong.play().then(() => {
                console.log("Playing track:", track);  // Confirm the track is playing
            }).catch((err) => {
                console.error("Error playing audio:", err);  // Log the error if something goes wrong
            });
        }
    };

    currentsong.onerror = function (error) {
        console.error("Error loading audio:", error);  // Log loading errors
    };
    
    document.querySelector(".songinfo").innerHTML=track
    document.querySelector(".songtime").innerHTML="00:00"
};

async function dispaly_albumb() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div");
    // console.log(div)
    div.innerHTML = response;
    // console.log(div.innerHTML)
    let ancors=div.getElementsByTagName("a")
    console.log(ancors)
    let cardcontainer=document.querySelector(".cardcontainer")
    let array=Array.from(ancors)
    // console.log(array)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
    
        if(e.href.includes("/songs")){
            let folder=e.href.split("/").slice(-2)[0]
          
            //get the meta data
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
           
            cardcontainer.innerHTML=cardcontainer.innerHTML+`                <div  data-folder="${folder}" class="card ">

                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none"/>
                            <polygon points="35,25 35,75 65,50" fill="black"/>
                          </svg>
                    </div>
                    <img src="songs/${folder}/cover.jpg" alt="image">
                    <h2>${response.title}!</h2>
                    <p>${response.description}!</p>
                </div>`
        }
    }
    
    Array.from (document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            
        })
    })
}

async function main() {
     await getsongs("songs/cs");
    playMusic(songs[0],true)
    
// dispaly all the albums dynamically
dispaly_albumb()

    play.addEventListener("click",()=>{
        if(currentsong.paused){

            currentsong.play()
            play.src="img/pause.svg"
        }
        else{
            currentsong.pause()
            play.src="img/play.svg"
        }
    })

    currentsong.addEventListener("timeupdate",()=>{
       
        document.querySelector(".songtime").innerHTML=`${convertSecondsToTime(currentsong.currentTime)}:/${convertSecondsToTime(currentsong.duration)}`
        document.querySelector(".circle").style.left=currentsong.currentTime/currentsong.duration*100+"%"
    })

        document.querySelector(".seekbar").addEventListener("click",e=>{
            const seekbar = e.target;
            const seekbarWidth = seekbar.getBoundingClientRect().width;
            const clickPosition = e.offsetX; // X position relative to the seekbar
            const progress = (clickPosition / seekbarWidth) * 100; // Calculate percentage
        
            // Move the circle to the clicked position
            document.querySelector(".circle").style.left = `${progress}%`;
        
            // Update the currentTime of the audio to jump to the clicked position
            const newTime = (progress / 100) * currentsong.duration; // Calculate new time in seconds
            currentsong.currentTime = newTime;
        })

        document.querySelector(".hamburger").addEventListener("click",()=>{
            document.querySelector(".left").style.left="0%";
        });

        document.querySelector(".close").addEventListener("click",()=>{
            document.querySelector(".left").style.left="-120%"
        });

        previous.addEventListener("click",()=>{
            let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0])
            if((index-1)>=0){
                currentsong.pause()
                playMusic(songs[index-1])
            }
            else{
                currentsong.pause()
                playMusic(songs[songs.length-1])
            }
        })
        next.addEventListener("click",()=>{
            let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0])
            if((index+1)<songs.length){
                currentsong.pause()
                playMusic(songs[index+1])
            }
            else
            {
                currentsong.pause()
                playMusic(songs[0])
            }
            
        })

        document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
                currentsong.volume=parseInt(e.target.value)/100
        })

        document.querySelector(".volume").addEventListener("click",e=>{
            console.log("clicked")
            if(e.target.src.endsWith("volume.svg"))
            {
                e.target.src="img/mute.svg"
                currentsong.volume=0;
                document.querySelector(".range").getElementsByTagName("input")[0].value=0
            }
            else{
                  e.target.src="img/volume.svg"
                  currentsong.volume=1;
                  document.querySelector(".range").getElementsByTagName("input")[0].value=10
            }

        })

}

main();
