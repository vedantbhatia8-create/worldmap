const express = require("express");
const path = require("path");
const foodHandler = require("./api/food");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));
app.post("/api/food", foodHandler);

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Destination Relaxation running at http://localhost:${PORT}`);
});
