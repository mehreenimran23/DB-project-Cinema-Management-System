import "dotenv/config";
import express from "express";
import cors from "cors";
import sql from "mssql";


const app = express();
app.use(express.json()); 
app.use(cors());


const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true, 
  },
};

console.log("Database Configuration:", dbConfig);


let pool;


const initializeDatabase = async () => {
  try {
    
    pool = await sql.connect(dbConfig);
    console.log("Connected to SQL Server successfully");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1); 
  }
};


app.listen(process.env.PORT || 3002, async () => {
  await initializeDatabase();  
  console.log(`Server is running on http://localhost:${process.env.PORT || 3002}`);
});


app.get("/", (req, res) => {
  res.json({ message: "Hello Backend Side" });
});

app.post("/now-showing", async (req, res) => {
  const { title, image, book_now } = req.body;

 
  if (!title || !image || !book_now) {
    return res.status(400).json({ error: "Title, Image, and Book Now URL are required." });
  }

  try 
  {  
await pool
.request()
.input("title", sql.NVarChar, title)
.input("image", sql.NVarChar, image)
.input("book_now", sql.NVarChar, book_now)
.query(
  "insert into NowShowing (title, image, book_now) values (@title, @image, @book_now)"
);


await pool
.request()
.input("title", sql.NVarChar, title)
.input("description", sql.Text, "Currently in Now Showing.") 
.input("image", sql.NVarChar, image)
.input("ageRating", sql.NVarChar, "PG") 
.input("moreDetails", sql.NVarChar, book_now)
.query(
  "insert into Movie (title, description, image, ageRating, moreDetails) values (@title, @description, @image, @ageRating, @moreDetails)"
);

    res.status(201).json({ message: "Movie added successfully to Now Showing and Movies." });
  } catch (err) {
    console.error("Error adding movie:", err);
    res.status(500).json({ error: "Error adding movie to Now Showing and Movies." });
  }
});


app.get("/now-showing", async (req, res) => {
  try {
    const result = await pool.request().query("select* from NowShowing");
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching 'Now Showing' movies:", err);
    res.status(500).json({ error: "Error fetching Now Showing movies." });
  }
});


app.post("/coming-soon", async (req, res) => {
  const { title, image, release_date } = req.body;

  if (!title || !image || !release_date) {
    console.error("Validation failed: Missing title, image, or release_date");
    return res.status(400).json({
      error: "Title, Image, and Release Date are required.",
    });
  }

  try {
    await pool
      .request()
      .input("title", sql.NVarChar, title)
      .input("image", sql.NVarChar, image)
      .input("release_date", sql.Date, release_date)
      .query(
        "insert into ComingSoon (title, image, release_date) values (@title, @image, @release_date)"
      );
    res.status(201).json({ message: "Movie added successfully to Coming Soon." });
  } catch (err) {
    console.error("Error adding movie to 'Coming Soon':", err);
    res.status(500).json({ error: "Error adding movie to Coming Soon." });
  }
});


app.get("/coming-soon-home", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("select* from ComingSoon order by release_date ASC");
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching 'Coming Soon' movies for Home Page:", err);
    res.status(500).json({ error: "Error fetching Coming Soon movies for Home Page." });
  }
});


app.get("/coming-soon", async (req, res) => {
  try {
    const result = await pool.request().query("select * from ComingSoon order by release_date ASC");
    res.status(200).json(result.recordset); 
  } catch (err) {
    console.error("Error fetching 'Coming Soon' movies:", err);
    res.status(500).json({ error: "Error fetching Coming Soon movies." });
  }
});


app.get("/movies", async (req, res) => {
  console.log("Testing database connection for /movies");
  try {
    const result = await pool.request().query("select* from Movie");
    console.log("Database connection successful:", result.recordset);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Database query failed:", err);
    res.status(500).json({ error: "Database connection issue" });
  }
});


//displaying show time of a particular movie
app.get("/showtimes/:movie_id", async (req, res) => {
  const { movie_id } = req.params;

  try 
  {
    const result = await pool
      .request()
      .input("movie_id", sql.Int, movie_id)
      .query("select * from showtimes where movie_id = @movie_id ORDER BY show_date, show_time");

    res.status(200).json(result.recordset);
  } 
  catch (err)
   {
    console.error("Error fetching showtimes:", err);
    res.status(500).json({ error: "Error fetching showtimes." });
  }
});

//adding new showtime
app.post("/showtimes", async (req, res) => {
  const { movie_id, show_date, show_time, showType } = req.body;  
  if (!movie_id || !show_date || !show_time || !showType) {
    return res.status(400).json({ error: "Movie ID, Show Date, Show Time, and Show Type are required." });
  }

  try 
  {
    await pool
      .request()
      .input("movie_id", sql.Int, movie_id)
      .input("show_date", sql.Date, show_date)
      .input("show_time", sql.Time, show_time)
      .input("showType", sql.NVarChar, showType)  
      .query(
        "insert into Showtimes (movie_id, show_date, show_time, showType) VALUES (@movie_id, @show_date, @show_time, @showType)"
      );

    res.status(201).json({ message: "Showtime added successfully." });
  } 
  catch (err) 
  {
    console.error("Error adding showtime:", err);
    res.status(500).json({ error: "Error adding showtime." });
  }
});

//retreiving movie details 
app.get("/movie-details/:movieTitle", async (req, res) => {
  const { movieTitle } = req.params;
  console.log("Received request for movie details:", movieTitle);

  try 
  {
    const pool = await poolPromise;
    const movieResult = await pool
      .request()
      .input("movieTitle", sql.NVarChar, movieTitle)
      .query(`
        SELECT 
          m.title, 
          md.description, 
          md.cast, 
          md.director, 
          md.duration, 
          md.genre, 
          m.opening_date, 
          md.trailer_url
        FROM Movie m
        JOIN MovieDetails md ON m.movie_id = md.movie_id
        WHERE m.title = @movieTitle
      `);

    console.log("Movie details query result:", movieResult.recordset);

    if (movieResult.recordset.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const movie = movieResult.recordset[0];

    const ratingResult = await pool
      .request()
      .input("movieTitle", sql.NVarChar, movieTitle)
      .query(`
        SELECT AVG(rating) AS average_rating
        FROM MovieRatings
        WHERE movie_title = @movieTitle
      `);

    console.log("Movie ratings query result:", ratingResult.recordset);

    const averageRating = ratingResult.recordset[0]?.average_rating || 0;

    res.status(200).json({      //avg rating k saath movie details display
      title: movie.title,
      description: movie.description,
      cast: movie.cast,
      director: movie.director,
      duration: movie.duration,
      genre: movie.genre,
      openingDate: movie.opening_date,
      trailer: movie.trailer_url,
      rating: averageRating.toFixed(1), 
    });

  } 
  catch (err) 
  {
    console.error("Error fetching movie details:", err);
    res.status(500).json({ error: "Error fetching movie details." });
  }
});

//sign up page
app.post("/signup", async (req, res) => {
  console.log("Signup POST request received");

  const {
    first_name, last_name, dob_month, dob_day, dob_year,
    gender, marital_status, email, phoneNo, address,
    postcode, city, password, terms,
  } = req.body;

  console.log("Form Data Received:", req.body);

  if 
  (
    !first_name || !last_name || !dob_month || !dob_day || !dob_year ||
    !email || !postcode || !password || terms === undefined
  ) {
    return res.status(400).json({ error: "All required fields must be filled out." });
  }

  try 
  {
    console.log("Checking for existing user...");
    const existingUser = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE email = @email");

    if (existingUser.recordset.length > 0)
       {
      return res.status(400).json({ error: "Email already in use." });
    }

    console.log("Inserting user into database...");
    await pool
      .request()
      .input("first_name", sql.NVarChar, first_name)
      .input("last_name", sql.NVarChar, last_name)
      .input("dob_month", sql.Int, dob_month)
      .input("dob_day", sql.Int, dob_day)
      .input("dob_year", sql.Int, dob_year)
      .input("gender", sql.NVarChar, gender)
      .input("marital_status", sql.NVarChar, marital_status)
      .input("email", sql.NVarChar, email)
      .input("phoneNo", sql.NVarChar, phoneNo)
      .input("address", sql.NVarChar, address)
      .input("postcode", sql.NVarChar, postcode)
      .input("city", sql.NVarChar, city)
      .input("password", sql.NVarChar, password)
      .input("terms_accepted", sql.Bit, terms)
      .query(`
        insert into Users (
          first_name, last_name, dob_month, dob_day, dob_year, gender,
          marital_status, email, phoneNo, address, postcode, city, 
          password, terms_accepted
        ) VALUES (
          @first_name, @last_name, @dob_month, @dob_day, @dob_year,
          @gender, @marital_status, @email, @phoneNo, @address, 
          @postcode, @city, @password, @terms_accepted
        )
      `);

    res.status(201).json({ message: "User registered successfully" });
  } 
  catch (err) 
  {
    console.error("Error inserting user data:", err);
    res.status(500).json({ error: "Unable to register user.", details: err.message });
  }
});

//login page
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Received email:", email);  // Debugging: Check email
  console.log("Received password:", password);  // Debugging: Check password

  try {
      if (!email || !password) {
          return res.status(400).json({ success: false, message: "Email and password are required" });
      }

      // Connect to the database
      const pool = await sql.connect(dbConfig);

      // Trim any spaces from the email
      const trimmedEmail = email.trim();

      // Query to fetch the user by email
      const result = await pool.request()
          .input("email", sql.VarChar, trimmedEmail)
          .query("SELECT * FROM Users WHERE email = @email");

      console.log("Database query result:", result.recordset); // Debugging: Check query result

      // Check if the user exists
      if (result.recordset.length === 0) {
          return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      const user = result.recordset[0];

      if (user.password !== password) {
          return res.status(401).json({ success: false, message: "Invalid email or password" });
      }
      const u = result.recordset[0];
      res.status(200).json({ message: "Login successful", userId: u.user_id });

      res.status(200).json({ success: true, message: "Login successful" });
      

  }  
  
  catch (err)
   {
      console.error("Login error:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//select tickets
app.post('/ticket', (req, res) => 
  {
  const { userId, movieName, numTickets, ticketPrice } = req.body;

  if (!userId || !movieName || !numbTickets || !ticketPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
  }

  const totalCost = numberTickets * ticketPrice;

  const query = 'insert into Tickets (user_id, movie_name, numTickets, ticket_price, total_cost) VALUES (?, ?, ?, ?, ?)';

  db.query(query, [userId, movieName, numTickets, ticketPrice, totalCost], (err, result) => {
      if (err) 
        {
          console.error('Error inserting ticket:', err);
          return res.status(500).json({ message: 'Error booking ticket' });
      }
      res.status(200).json({
          message: 'Ticket booked successfully',
          ticketId: result.insertId, 
          totalCost: totalCost
      });
  });
});
