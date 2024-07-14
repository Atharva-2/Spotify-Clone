let currentSong = new Audio();
let songs;

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
  let a = await fetch(`http://127.0.0.1:5500/songs/${folder}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/songs/${folder}`)[1]);
    }
  }
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = "/songs/" + track;
  if (!pause) {
    currentSong.play();
    play.src = "svgs/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
    currentSong.currentTime
  )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
};

async function main() {
  songs = await getSongs();
  playMusic(songs[0], true);

  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
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
