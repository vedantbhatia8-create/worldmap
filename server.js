const express = require("express");
const path = require("path");
const completeHandler = require("./api/complete");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));
app.post("/api/complete", completeHandler);

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Destination Relaxation running at http://localhost:${PORT}`);
});
