const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const categoryRoutes = require('./routes/category')
const itemRoutes = require('./routes/itemRoutes');


// Routes
app.use('/api/categories', categoryRoutes);


app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("/", express.static("uploads"));
app.use("/test", (req, res) => {
  res.send("Hello world!");
});

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use("/api", itemRoutes);

// Enable CORS with specific configuration
app.use(cors({
  origin: 'http://localhost:8000',  // Allow requests only from this frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allow specific headers
  credentials: true  // Allow credentials like cookies, authorization headers, etc.
}));


// config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({
      path: "config/.env",
    });
}

//import routes
const user = require("./controller/user");

app.use("/api/v2/user", user)

// it's for ErrorHandling
app.use(ErrorHandler);
module.exports = app;