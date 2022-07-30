const http = require("http");
const fs   = require('fs');
const path = require('path');

const host = '10.1.1.4';
const port = 8080;
const root = '/run/media/public/sdb2/_s/_ks/music'

var head        = fs.readFileSync(path.join(__dirname, "head.html"));
var css         = fs.readFileSync(path.join(__dirname, "style.css"));
var player_html = fs.readFileSync(path.join(__dirname, "player.html"));
var player_js   = fs.readFileSync(path.join(__dirname, "player.js"));

function directory_listing(root, relpath) {
  // make sure that root has no trailing / and that relpath starts and ends with /
  console.log("gen root=",root);
  console.log("gen relpath=",relpath);
  var fullpath = root + relpath;
  console.log("gen fullpath=", fullpath);
  console.log("relpath=",relpath);
  var pathseg = fullpath.split(path.sep);
  console.log("pathseg=", pathseg)
  var mp3_list = [];
  var possible_images = ["Folder.jpg", "folder.jpg", "Cover.jpg", "cover.jpg", "AlbumArtSmall.jpg"];
  var cover;
  var ul = `<ul>
  <li><a href="..">..</li>
  `
  files = fs.readdirSync(fullpath);
  files.forEach(file => {
    console.log("gen file=", file);
    var stat = fs.statSync(root+relpath+file);
    if (stat && stat.isDirectory()) {
      ul +=`<li><a href="./${file}/">d ${file}/</a></li>\n`;
    } else {
      ul +=`<li><a href="./${file}">f ${file}</a></li>\n`;
      if (file.split('.').pop() == 'mp3'){
        mp3_list.push(file);
      }
      if (possible_images.includes(file)){
        console.log("cover art found");
        cover = file;
      }
    }
  });
  console.log("cover=",cover);
  var track_list=[];
  mp3_list.forEach(file => {
    track_list.push({
      image: cover,
      path: file,
      name: file,
      artist: pathseg[pathseg.length-3]
    })
  })
  ul += `<ul>\n`
  //console.log("track_list=", track_list);
  var dl=`
  <hr>
  <h1>Directory listing for ${relpath}</h1>
  ${ul}`

  var tail =`<!-- Load the main script for the player -->
  <script>
  var track_list = ${JSON.stringify(track_list)};
  ${player_js}
  </script>
  </body>
  </html>`;
  //console.log("HTML=");
  //console.log(html);
  return head+player_html+dl+tail;
  }
const requestListener = function (req, res) {
  console.log("RL req.url=", req.url);
  console.log("RL root=", root);
  var relpath = decodeURIComponent(req.url);
  console.log("RL relpath=", relpath)
  // if (relpath=='/') {
  //   relpath = '';
  // }
  var fullpath = root + relpath;
  console.log("RL fullpath=", fullpath);
  

  if (req.url == "/style.css") {
    //console.log("req css");
    res.setHeader("Content-Type", "text/css");
    res.writeHead(200);
    res.end(css);
    return;
  }
  try {
    console.log("RL try");
    var stat = fs.statSync(fullpath);
  } catch{
    return;
  }
  //console.log("stat=", stat);
  //console.log("stat.isDirectory()=", stat.isDirectory());
  //console.log("stat.isFile()=", stat.isFile());
  
  if (stat && stat.isDirectory()){
    // if (relpath.length>1 && relpath[relpath.length]!='/'){
    //   relpath+='/';
    // }
    //console.log("is directory");

    if (relpath[relpath.length-1]!='/') relpath+='/';
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    var content = directory_listing(root,relpath);
    res.end(content);
    return;
  }

  fs.readFile(root + relpath, function(error, data) {
    console.log("req some file or something");
    if (error) {
      console.log("error=", error);
      res.writeHead(404);
      res.write('Error: File Not Found');
    } else {
      res.write(data);
    }
    res.end();
  })


}
const server = http.createServer(requestListener);
server.listen(port, host, (error) => {
  if (error) {
    console.log('Something went wrong', error);
  } else {
  console.log(`Server is running on http://${host}:${port}`);
  }
});
