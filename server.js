const http = require("http");
const fs = require('fs');
console.log("__dirname=", __dirname)
function generate(root, relpath) {
  console.log("root=",root);
  console.log("relpath=",relpath);
  console.log("full=",root+relpath);
  var relpathnoslash = relpath.slice(0,relpath.length - 1);
  files = fs.readdirSync(root+relpath);
  var track_list = [];
  var ul = `<ul>
  <li><a href="..">..</li>
  `
  files.forEach(file => {
    console.log("file=", file);
    var stat = fs.statSync(root+relpath+file);
    if (stat && stat.isDirectory()) {
      ul +=`<li><a href="./${file}/">d ${file}/</a></li>\n`;
    } else {
      ul +=`<li><a href="./${file}">f ${file}</li>\n`;
      if (file.split('.').pop() == 'mp3'){
        track_list.push({
          name:"name",
          artist:"artist",
          path: relpath + file
        })
      }
    }
  });
  ul += `<ul>\n`
  //console.log("track_list=", track_list);
  html=`<html>
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple Music Player</title>
  <!-- Load FontAwesome icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css">

  <!-- Load the custom CSS style file -->
  <link rel="stylesheet" type="text/css" href="/style.css">
  </head>
  <body>
  <div class="player">
    <div class="details">
      <div class="now-playing">PLAYING x OF y</div>
      <div class="track-art"></div>
      <div class="track-name">Track Name</div>
      <div class="track-artist">Track Artist</div>
    </div>
    <div class="buttons">
      <div class="prev-track" onclick="prevTrack()"><i class="fa fa-step-backward fa-2x"></i></div>
      <div class="playpause-track" onclick="playpauseTrack()"><i class="fa fa-play-circle fa-5x"></i></div>
      <div class="next-track" onclick="nextTrack()"><i class="fa fa-step-forward fa-2x"></i></div>
    </div>
    <div class="slider_container">
      <div class="current-time">00:00</div>
      <input type="range" min="1" max="100" value="0" class="seek_slider" onchange="seekTo()">
      <div class="total-duration">00:00</div>
    </div>
    <div class="slider_container">
      <i class="fa fa-volume-down"></i>
      <input type="range" min="1" max="100" value="99" class="volume_slider" onchange="setVolume()">
      <i class="fa fa-volume-up"></i>
    </div>
    <button class="stop_after" onclick="toggle()">stop after song finishes</button>
  </div>

  <hr>
  <h1>Directory listing for ${relpath}</h1>
  ${ul}

  <!-- Load the main script for the player -->
<script>
let player_background = document.querySelector(".player");
let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");
let toggle_btn = document.querySelector(".stop_after");


let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");

let track_index = 0;
let isPlaying = false;
let stop_after = false;
let updateTimer;

// Create new audio element
let curr_track = document.createElement('audio');


// Define the tracks that have to be played
let track_list = ${JSON.stringify(track_list)};
function random_bg_color() {

  // Get a number between 64 to 256 (for getting lighter colors)
  let red = Math.floor(Math.random() * 256) + 64;
  let green = Math.floor(Math.random() * 256) + 64;
  let blue = Math.floor(Math.random() * 256) + 64;

  // Construct a color withe the given values
  let bgColor = "rgb(" + red + "," + green + "," + blue + ")";

  // Set the background to that color
  //player_background.style.background = bgColor;
}

function toggle() {
  if (stop_after) {
    toggle_btn.innerHTML = "stop after song finishes";
    stop_after = false;
  } else {
    toggle_btn.innerHTML = "continue after song finishes";
    stop_after = true;
  }
}

function loadTrack(track_index) {
  clearInterval(updateTimer);
  resetValues();
  curr_track.src = track_list[track_index].path;
  console.log(curr_track.load());

  track_name.textContent = track_list[track_index].name;
  track_artist.textContent = track_list[track_index].artist;
  now_playing.textContent = "PLAYING " + (track_index + 1) + " OF " + track_list.length;

  updateTimer = setInterval(seekUpdate, 1000);
  curr_track.addEventListener("ended", nextTrack);
  //random_bg_color();
}

function resetValues() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

// Load the first track in the tracklist
loadTrack(track_index);

function playpauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  curr_track.play();
  isPlaying = true;
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
}

function nextTrack() {
  if (track_index < track_list.length - 1)
    track_index += 1;
  else{
    track_index = 0;
    return;}
  loadTrack(track_index);
  if (!stop_after){
        playTrack();
      } else {
        playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
      }
    
}

function prevTrack() {
  if (track_index > 0)
    track_index -= 1;
  else track_index = track_list.length;
  loadTrack(track_index);
  playTrack();
}

function seekTo() {
  let seekto = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekto;
}

function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

function seekUpdate() {
  let seekPosition = 0;

  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);

    seek_slider.value = seekPosition;

    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

    if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
    if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
    if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
    if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
}


  </script>
  </body>
  </html>`;
  //console.log("HTML=");
  //console.log(html);
  return html;
  }
function generatejson(root, relpathjson) {
  console.log("relpathjson=", relpathjson);
  var tracklist = [];
  relpath = relpathjson.slice(0,relpathjson.length - 5)+'/';
  console.log("sliced relpath=", relpath);
  files = fs.readdirSync(root + relpath);
  files.forEach(file => {
    console.log("file=", file);
    var stat = fs.statSync(root + relpath + file);
    if (stat && stat.isFile() && file.split(".").pop() == "mp3") {
      tracklist.push({
      "name":"name",
      "artist":"artist",
      "path": file
      });}
  });
  console.log(tracklist);
  //var rv = "var track_list = " + JSON.stringify(tracklist);
  var rv = JSON.stringify(tracklist);
  console.log(rv);
  return rv;  
}

const host = 'localhost';
const port = 8080;
const root = '/run/media/public/sdb2/_s/_ks/music'
var css = `body {
  background-color: white;

  /* Smoothly transition the background color */
  transition: background-color .5s;
}

.player {
  background-color: blue;
  height: 95vh;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

.details {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin-top: 25px;
}

.track-art {
  margin: 25px;
  height: 250px;
  width: 250px;
  background-image: url("https://images.pexels.com/photos/262034/pexels-photo-262034.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260");
  background-size: cover;
  border-radius: 15%;
}

.now-playing {
  font-size: 1rem;
}

.track-name {
  font-size: 3rem;
}

.track-artist {
  font-size: 1.5rem;
}

.buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.playpause-track, .prev-track, .next-track {
  padding: 25px;
  opacity: 0.8;

  /* Smoothly transition the opacity */
  transition: opacity .2s;
}

.playpause-track:hover, .prev-track:hover, .next-track:hover {
  opacity: 1.0;
}

.slider_container {
  width: 75%;
  max-width: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Modify the appearance of the slider */
.seek_slider, .volume_slider {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  height: 5px;
  background: black;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

/* Modify the appearance of the slider thumb */
.seek_slider::-webkit-slider-thumb, .volume_slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  background: white;
  cursor: pointer;
  border-radius: 50%;
}

.seek_slider:hover, .volume_slider:hover {
  opacity: 1.0;
}

.seek_slider {
  width: 60%;
}

.volume_slider {
  width: 30%;
}

.current-time, .total-duration {
  padding: 10px;
}

i.fa-volume-down, i.fa-volume-up {
  padding: 10px;
}

i.fa-play-circle, i.fa-pause-circle, i.fa-step-forward, i.fa-step-backward {
  cursor: pointer;
}`

const requestListener = function (req, res) {
  console.log("req.url=", req.url);
  var relpath = decodeURIComponent(req.url);
  console.log("relpath=", relpath)
  

  if (req.url == "/style.css") {
    res.setHeader("Content-Type", "text/css");
    res.writeHead(200);
    res.end(css);
    return;
  }
  if (relpath.split(".").pop() == "json") {
    console.log("req json");
    res.setHeader("Content-Type", "text/json");
    res.writeHead(200);
    res.end(generatejson(root, relpath));
    return;
  }
  var stat = fs.statSync(root + relpath);
  console.log("stat=", stat);
  console.log("stat.isDirectory()=", stat.isDirectory());
  console.log("stat.isFile()=", stat.isFile());
  if (stat && stat.isDirectory()){
    console.log("is directory");
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    var content = generate(root,relpath);
    res.end(content);
    return;
  }
  if (stat && stat.isFile()){
    console.log("else file");
    try {
    var contents = fs.readFileSync(root + relpath);
    res.writeHead(200);
    res.end(contents);
    } catch (err) {
      console.log("caught error");
      res.writeHead(404);
      res.end("<h1>404</h1");
    }
    //res.setHeader("Content-Type", "text/html")
    console.log("else file close");
    return;
  }
}
const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
