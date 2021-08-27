const http = require("http");
const { queryAccountBalance } = require(".");

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/plain");

  queryAccountBalance().then(
    function (data) {
      res.statusCode = 200;
      res.end(data);
    },
    function (error) {
      res.statusCode = 500;
      res.end(JSON.stringify(error));
    }
  );
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
