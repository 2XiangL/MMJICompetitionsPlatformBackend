const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path")
const competitionRoutes = require("./routes/competitions");
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/team');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/competitions", competitionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/admin', adminRoutes);

app.listen(8080, () => {
	console.log("Listening at 8080......");
});
