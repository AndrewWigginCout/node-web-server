const http = require("http");
const fs = require('fs');
console.log("__dirname=", __dirname)
function generate(folderPath) {
  //folderPath = folderPath;
  console.log("foldePath=", folderPath);
  head = "<title>dir</title>";
  files = fs.readdirSync(folderPath);
  html=`<html>
  <head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>Directory listing for ${folderPath}</title>
  </head>
  <body>
  <h1>Directory listing for ${folderPath}</h1>
  <hr>
  <ul>`;
  files.forEach(file => {
    var stat = fs.statSync(folderPath+file);
    if (stat && stat.isDirectory()) {
      html+=`<li><a href="${file}/">d ${file}/</a></li>\n`;
    } else {
      html+=`<li><a href="${file}">f ${file}</a></li>\n`;
    }

  });
  html+=`</ul>
  <hr>
  </body>
  </html>`
  //console.log(html);
  return html
  }

const host = 'localhost';
const port = 8080;
const root = '/run/media/public/sdc2/_s/_ks/music'

const requestListener = function (req, res) {
  console.log("req.url=", req.url);
  var path = decodeURIComponent(req.url);
  console.log("path=", path)
    
  var stat = fs.statSync(root + path);
  if (stat && stat.isDirectory()){
    console.log("is directory");
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(generate(root + path));
  } else{
    console.log("else");
    var contents = fs.readFileSync(root + path);
    //res.setHeader("Content-Type", "text/html")
    res.writeHead(200);
    res.end(contents);
  }
}
const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
