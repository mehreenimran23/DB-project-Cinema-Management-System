import "dotenv/config";
import express from "express";
import cors from "cors";
import sql from "mssql";


const app = express();
app.use(express.json());  //parse data for json
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

//home page Now-Showing category (adding movies to now showing)
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


await pool   //adding movies in Movie page at same time
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

//retreiving all movies from now showing
app.get("/now-showing", async (req, res) => 
  {
  try {
    const result = await pool.request().query("select* from NowShowing");
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching 'Now Showing' movies:", err);
    res.status(500).json({ error: "Error fetching Now Showing movies." });
  }
});

//home page coming-soon category (adding movies to coming soon)
app.post("/coming-soon", async (req, res) => 
  {
  const { title, image, release_date } = req.body;

  if (!title || !image || !release_date) 
    {
    console.error("Validation failed: Missing title, image, or release_date");
    return res.status(400).json({
      error: "Title, Image, and Release Date are required.",
    });
  }

  try 
  {
    await pool           // At same time adding same coming-soon movie to Coming-Soon page
      .request()
      .input("title", sql.NVarChar, title)
      .input("image", sql.NVarChar, image)
      .input("release_date", sql.Date, release_date)
      .query(
        "insert into ComingSoon (title, image, release_date) values (@title, @image, @release_date)"
      );
    res.status(201).json({ message: "Movie added successfully to Coming Soon." });
  } 
  catch (err) 
  {
    console.error("Error adding movie to 'Coming Soon':", err);
    res.status(500).json({ error: "Error adding movie to Coming Soon." });
  }
});

//retreiving coming soon movies from home page
app.get("/coming-soon-home", async (req, res) => 
  {
  try 
  {
    const result = await pool
      .request()
      .query("select* from ComingSoon order by release_date ASC");
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching 'Coming Soon' movies for Home Page:", err);
    res.status(500).json({ error: "Error fetching Coming Soon movies for Home Page." });
  }
});

//retreiving coming soon movies from Coming-soon page
app.get("/coming-soon", async (req, res) => {
  try {
    const result = await pool.request().query("select * from ComingSoon order by release_date ASC");
    res.status(200).json(result.recordset); 
  } catch (err) {
    console.error("Error fetching 'Coming Soon' movies:", err);
    res.status(500).json({ error: "Error fetching Coming Soon movies." });
  }
});

//retreiving movies data from Movies page
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


//retreiving show time of a particular movie
app.get("/showtimes/:movie_id", async (req, res) => 
  {
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
app.post("/showtimes", async (req, res) => 
  {
  const { movie_id, show_date, show_time, showType } = req.body;  
  if (!movie_id || !show_date || !show_time || !showType) 
    {
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
          md.release_date, 
          md.trailer_url
        from Movie m
        join MovieDetails md on m.movie_id = md.movie_id
        where m.title = @movieTitle
      `);

    console.log("Movie details query result:", movieResult.recordset);

    if (movieResult.recordset.length === 0) 
      {
      return res.status(404).json({ message: "Movie not found" });
      }

    const movie = movieResult.recordset[0];

    const ratingResult = await pool
      .request()
      .input("movieTitle", sql.NVarChar, movieTitle)
      .query(`
        select avg (rating) as averageRating
        from MovieRatings
        where movie_title = @movieTitle
      `);

    console.log("Movie ratings query result:", ratingResult.recordset);
    res.status(200).json({      //avg rating k saath movie details display
      title: movie.title,
      description: movie.description,
      cast: movie.cast,
      director: movie.director,
      duration: movie.duration,
      genre: movie.genre,
      openingDate: movie.release_date,
      trailer: movie.trailer_url,
      rating: averageRating
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

  const
   {
    first_name, last_name, dob_month, dob_day, dob_year,
    gender, marital_status, email, phoneNo, address,
    postcode, city, password, terms,
  } = req.body;

  console.log("Form Data Received:", req.body);

  if 
  (
    !first_name || !last_name || !dob_month || !dob_day || !dob_year ||
    !email || !postcode || !password || terms === undefined
  ) 
  {
    return res.status(400).json({ error: "All required fields must be filled out." });
  }

  try 
  {
    console.log("Checking for existing user...");
    const existingUser = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("select * from Users where email = @email");

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
        ) values
         (
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
app.post("/login", async (req, res) => 
  {
  const { email, password } = req.body;

  console.log("Received email:", email);  
  console.log("Received password:", password);  

  try {
      if (!email || !password)
         {
          return res.status(400).json({ success: false, message: "Email and password are required" });
        }

      const pool = sql.connect(dbConfig);
      const trimmedEmail = email.trim();

      const result = await pool.request()
          .input("email", sql.VarChar, trimmedEmail)
          .query("select * from Users where email = @email");

      console.log("Database query result:", result.recordset); 

      if (result.recordset.length === 0)
         {
          return res.status(401).json({ success: false, message: "Invalid email or password" });
         }

      const user = result.recordset[0];

      if (user.password !== password) 
        {
          return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
      const u = result.recordset[0];
      res.status(200).json({ message: "Login successful", userId: u.user_id });

      res.status(200).json({ success: true, message: "Login successful" });     
  }   
  catch (err)
   {
      console.error("Login error:", err);
      res.status(500).json({ success: false, message: "Internal server ka masla hai" });
  }
});

// tickets page
app.post('/ticket', (req, res) => 
  {
  const { userId, movieName, numTickets, ticketPrice } = req.body;

  if (!userId || !movieName || !numbTickets || !ticketPrice) 
    {
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

//seat-selection page
app.get("/seats", async (req, res) => 
  {
  try 
  {
    const result = await pool.request().query('select * from Seats where isReserved = 0');
    res.json(result.recordset);
  }
   catch (err) 
  {
    console.error("Error fetching seats:", err.message);
    res.status(500).send('Error fetching available seats'); //debugging error a raha hai
  }
});

//booking for seat-selection
app.post("/book", async (req, res) => 
  {
  try 
  {
      let { selectedSeats, userId, showtimeId, totalAmount, paymentMethod } = req.body;

      if (typeof selectedSeats === 'string')
         {
          selectedSeats = selectedSeats.split(',').map(seat => seat.trim());
         }

      if (!Array.isArray(selectedSeats))
         {
          return res.status(400).send("Invalid data format for selected seats.");
         }

      const poolRequest = pool.request();

      for (let seat of selectedSeats) 
        {
          await poolRequest
              .input('seatNumber', sql.VarChar, seat)
              .input('showtimeId', sql.Int, showtimeId)
              .query
              (`
                update seats
                  set isReserved = 1
                  where seatNumber = @seatNumber
                  and showtimeId = @showtimeId
                  and isReserved = 0;  
              `);
      }
      res.status(200).send("Seats reserved successfully.");
  } 
  catch (err)
   {
      console.error("Error updating seats:", err.message, err.stack);
      res.status(500).send("Error reserving seats.");
  }
});

//payment page
app.post('/payment', async (req, res) => 
  {
  const {
      movieName,
      numTickets,
      ticketCost,
      selectedSeats,
      seatCost,
      snacksList,
      snacksCost,
      totalCost,
      paymentMethod,
      cardholderName,
      cardNumber,
      expiryDate,
      cvv,
      bankName,
  } = req.body;

  if (
      !movieName ||
      !numTickets ||
      !ticketCost ||
      !selectedSeats ||
      !seatCost ||
      !totalCost ||
      !paymentMethod
  )
   {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try 
  {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
          .input('movieName', sql.VarChar, movieName)
          .input('numTickets', sql.Int, numTickets)
          .input('ticketCost', sql.Decimal(10, 2), ticketCost)
          .input('selectedSeats', sql.VarChar, selectedSeats.join(', '))
          .input('seatCost', sql.Decimal(10, 2), seatCost)
          .input('snacksList', sql.VarChar, snacksList)
          .input('snacksCost', sql.Decimal(10, 2), snacksCost)
          .input('totalCost', sql.Decimal(10, 2), totalCost)
          .input('paymentMethod', sql.VarChar, paymentMethod)
          .input('cardholderName', sql.VarChar, cardholderName || null)
          .input('cardNumber', sql.VarChar, cardNumber || null)
          .input('expiryDate', sql.VarChar, expiryDate || null)
          .input('cvv', sql.VarChar, cvv || null)
          .input('bankName', sql.VarChar, bankName || null)
          .query(`
             insert into (
                  movie_name, num_tickets, ticket_cost, selected_seats, seat_cost, 
                  snacks_list, snacks_cost, total_cost, payment_method, cardholder_name, 
                  card_number, expiry_date, cvv, bank_name
              ) 
             values (
                  @movieName, @numTickets, @ticketCost, @selectedSeats, @seatCost, 
                  @snacksList, @snacksCost, @totalCost, @paymentMethod, @cardholderName, 
                  @cardNumber, @expiryDate, @cvv, @bankName
              )
          `);

      res.status(200).json({ success: true, message: 'Payment processed successfully!' });
  }
   catch (err) 
   {
      console.error('Payment processing error:', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//adding movies to homepage for nowshowing
// adding movies for homepage coming soon works w frontend as well
//adding movies to movie page works with frontend as well
//adding movies to now-showing page works with frontend as well
//showtimes in movie details work for backend cannot display on froentend due to issue w moviedetails 
//ratings work for backend cannot dispay due to moviedetails issue
//sign up page works w frontedn as well
//log in page works w frontend as well
//tickets work w backend but due to issue with moviedteails cant fetch proper data
//seat-selection page works w frontend as well
//payment works for backend and frontend too but cannot access unless moviedetails works or webpage functions in order
