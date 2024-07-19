let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li> 
        <img class="invert" src="svgs/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div class="grey">song artist</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="svgs/play.svg" alt="">
            </div>
       </li>`;
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "svgs/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
    currentSong.currentTime
  )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
};

async function displayAlbums() {
  let cardContainer = document.querySelector(".cardContainer");

  let a = await fetch(`http://127.0.0.1:5500/songs`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");

  let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
      const e = array[index];    

      if (e.href.includes("/songs")) {
        let folder = e.href.split("/")[4];
        let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
        let response = await a.json();
        cardContainer.innerHTML =
          cardContainer.innerHTML +
          `
          <div data-folder="hindi" class="card">
            <div class="play">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000"
                fill="none">
              <path
                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                    stroke="currentColor" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
              </div>
              <img src="/songs/${folder}/cover.jpg" alt="">
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>
        `;
    }
  }

  //code for dynamic playlist loading
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log(item.currentTarget.dataset.folder);
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}

async function main() {
  await getSongs("songs/Hindi");
  playMusic(songs[0], true);

  displayAlbums();

  //eventlistener for play pause button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "svgs/pause.svg";
    } else {
      currentSong.pause();
      play.src = "svgs/play.svg";
    }
  });

  //eventlistner for updating the song duration and moving the seekbar circle
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;

    const circle = document.querySelector(".circle");
    circle.style.left =
      (currentSong.currentTime / currentSong.duration) * 99 + "%";
  });

  //eventlistner for seekbar
  const seekbar = document.querySelector(".seekbar");

  seekbar.addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";

    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // eventlistner for opening the hamburger menu
  const hamburger = document.querySelector(".hamburger");

  hamburger.addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // eventlistner for closing the hamburger menu
  const close = document.querySelector(".close");

  close.addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // eventlistener for playing previous song
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
      document.querySelector(".songinfo").innerText = songs[
        index - 1
      ].replaceAll("%20", " ");
    }
  });

  // eventlistener for playing next song
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
      document.querySelector(".songinfo").innerText = songs[
        index + 1
      ].replaceAll("%20", " ");
    }
  });

  //eventlistner for changing the volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });
}

main();
