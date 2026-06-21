import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSeedData } from "./data/seed-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, "../Frontend");
const dataDir = path.resolve(__dirname, "./data");
const dataFile = path.join(dataDir, "data.json");
const port = Number(process.env.PORT || 3002);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

let dataStore;

function nextId(items, key) {
  return items.reduce((max, item) => Math.max(max, Number(item[key] || 0)), 0) + 1;
}

function normalizeTitle(value) {
  return decodeURIComponent(String(value || ""))
    .trim()
    .toLowerCase();
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(message);
}

async function saveData() {
  await fs.writeFile(dataFile, JSON.stringify(dataStore, null, 2), "utf8");
}

async function ensureDataStore() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    const raw = await fs.readFile(dataFile, "utf8");
    dataStore = JSON.parse(raw);
  } catch {
    dataStore = createSeedData();
    await saveData();
  }
}

async function readRequestBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(rawBody);
}

function calculateAverageRating(movieTitle) {
  const ratings = dataStore.ratings.filter(
    (item) => normalizeTitle(item.movie_title) === normalizeTitle(movieTitle)
  );

  if (ratings.length === 0) {
    return 0;
  }

  const total = ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0);
  return Number((total / ratings.length).toFixed(1));
}

function getRatingsSummary() {
  return dataStore.movies
    .map((movie) => ({
      movie_id: movie.movie_id,
      title: movie.title,
      image: movie.image,
      ageRating: movie.ageRating,
      moreDetails: movie.moreDetails,
      averageRating: calculateAverageRating(movie.title),
      totalRatings: dataStore.ratings.filter(
        (item) => normalizeTitle(item.movie_title) === normalizeTitle(movie.title)
      ).length,
    }))
    .sort((a, b) => b.averageRating - a.averageRating || b.totalRatings - a.totalRatings);
}

function getTicketPrice(showType) {
  return showType === "PLATINUM" ? 1500 : 1200;
}

function getSeatPrice(showType) {
  return showType === "PLATINUM" ? 250 : 150;
}

function isValidExpiryDate(value) {
  return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
}

function isValidCardNumber(value) {
  return /^\d{12,19}$/.test(value);
}

function isValidCvv(value) {
  return /^\d{3,4}$/.test(value);
}

function matchRoute(pathname, prefix) {
  return pathname.startsWith(prefix) ? pathname.slice(prefix.length) : null;
}

async function handleApi(request, response, url) {
  const { pathname, searchParams } = url;

  if (request.method === "GET" && pathname === "/api/health") {
    return sendJson(response, 200, { ok: true });
  }

  if (request.method === "GET" && pathname === "/api/now-showing") {
    return sendJson(response, 200, dataStore.nowShowing);
  }

  if (request.method === "GET" && pathname === "/api/coming-soon") {
    return sendJson(
      response,
      200,
      [...dataStore.comingSoon].sort((a, b) => a.release_date.localeCompare(b.release_date))
    );
  }

  if (request.method === "GET" && pathname === "/api/coming-soon-home") {
    return sendJson(
      response,
      200,
      [...dataStore.comingSoon].sort((a, b) => a.release_date.localeCompare(b.release_date))
    );
  }

  if (request.method === "GET" && pathname === "/api/movies") {
    return sendJson(response, 200, dataStore.movies);
  }

  if (request.method === "GET" && pathname === "/api/cinemas") {
    return sendJson(response, 200, dataStore.cinemas || []);
  }

  if (request.method === "GET" && pathname === "/api/ratings-summary") {
    return sendJson(response, 200, getRatingsSummary());
  }

  const movieTitlePath = matchRoute(pathname, "/api/movie-title/");
  if (request.method === "GET" && movieTitlePath !== null) {
    const movieId = Number(movieTitlePath);
    const movie = dataStore.movies.find((item) => item.movie_id === movieId);

    if (!movie) {
      return sendJson(response, 404, { error: "Movie not found." });
    }

    return sendJson(response, 200, { title: movie.title });
  }

  const movieDetailsPath = matchRoute(pathname, "/api/movie-details/");
  if (request.method === "GET" && movieDetailsPath !== null) {
    const movie = dataStore.movies.find(
      (item) => normalizeTitle(item.title) === normalizeTitle(movieDetailsPath)
    );

    if (!movie) {
      return sendJson(response, 404, { error: "Movie not found." });
    }

    const details = dataStore.movieDetails.find((item) => item.movie_id === movie.movie_id);

    if (!details) {
      return sendJson(response, 404, { error: "Movie details not found." });
    }

    return sendJson(response, 200, {
      movie_id: movie.movie_id,
      title: movie.title,
      image: movie.image,
      ageRating: movie.ageRating,
      description: details.description,
      cast: details.cast,
      director: details.director,
      duration: `${details.duration} minutes`,
      genre: details.genre,
      openingDate: details.release_date,
      trailer: details.trailer_url,
      rating: calculateAverageRating(movie.title),
    });
  }

  const showtimesPath = matchRoute(pathname, "/api/showtimes/");
  if (request.method === "GET" && showtimesPath !== null) {
    const movieId = Number(showtimesPath);
    const showtimes = dataStore.showtimes
      .filter((item) => item.movie_id === movieId)
      .sort((a, b) => `${a.show_date} ${a.show_time}`.localeCompare(`${b.show_date} ${b.show_time}`));

    return sendJson(response, 200, showtimes);
  }

  if (request.method === "GET" && pathname === "/api/seats") {
    const showtimeId = Number(searchParams.get("showtimeId"));

    if (!showtimeId) {
      return sendJson(response, 400, { error: "Showtime ID is required." });
    }

    const seats = dataStore.seats
      .filter((item) => item.showtimeId === showtimeId)
      .sort((a, b) => a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true }));

    return sendJson(response, 200, seats);
  }

  if (request.method === "POST" && pathname === "/api/signup") {
    const body = await readRequestBody(request);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const firstName = String(body.first_name || "").trim();
    const lastName = String(body.last_name || "").trim();
    const postcode = String(body.postcode || "").trim();
    const termsAccepted = Boolean(body.terms || body.terms_accepted);

    if (!firstName || !lastName || !email || !password || !postcode || !termsAccepted) {
      return sendJson(response, 400, {
        error: "First name, last name, email, postcode, password, and terms are required.",
      });
    }

    const existingUser = dataStore.users.find(
      (user) => String(user.email || "").trim().toLowerCase() === email
    );

    if (existingUser) {
      return sendJson(response, 400, { error: "Email already in use." });
    }

    const user = {
      user_id: nextId(dataStore.users, "user_id"),
      first_name: firstName,
      last_name: lastName,
      dob_month: Number(body.dob_month || 1),
      dob_day: Number(body.dob_day || 1),
      dob_year: Number(body.dob_year || 2000),
      gender: String(body.gender || "other").toLowerCase(),
      marital_status: String(body.marital_status || "single").toLowerCase(),
      email,
      phoneNo: String(body.mobile || body.phoneNo || "").trim(),
      address: String(body.address || "").trim(),
      postcode,
      city: String(body.city || "").trim(),
      password,
      terms_accepted: termsAccepted,
      created_at: new Date().toISOString(),
    };

    dataStore.users.push(user);
    await saveData();

    return sendJson(response, 201, {
      message: "Account created successfully.",
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  }

  if (request.method === "POST" && pathname === "/api/login") {
    const body = await readRequestBody(request);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return sendJson(response, 400, {
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = dataStore.users.find(
      (item) =>
        String(item.email || "").trim().toLowerCase() === email && item.password === password
    );

    if (!user) {
      return sendJson(response, 401, {
        success: false,
        message: "Invalid email or password.",
      });
    }

    return sendJson(response, 200, {
      success: true,
      message: "Login successful.",
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  }

  if (request.method === "POST" && pathname === "/api/rate-movie") {
    const body = await readRequestBody(request);
    const movieTitle = String(body.movieTitle || "").trim();
    const rating = Number(body.rating);
    const userId = Number(body.userId);

    if (!movieTitle || !userId || Number.isNaN(rating) || rating < 1 || rating > 5) {
      return sendJson(response, 400, { error: "Movie, rating, and user are required." });
    }

    const existingRating = dataStore.ratings.find(
      (item) =>
        normalizeTitle(item.movie_title) === normalizeTitle(movieTitle) &&
        Number(item.user_id) === userId
    );

    if (existingRating) {
      existingRating.rating = rating;
    } else {
      dataStore.ratings.push({
        movie_title: movieTitle,
        rating,
        user_id: userId,
      });
    }

    await saveData();

    return sendJson(response, 200, {
      message: "Rating saved successfully.",
      averageRating: calculateAverageRating(movieTitle),
    });
  }

  if (request.method === "POST" && pathname === "/api/ticket") {
    const body = await readRequestBody(request);
    const userId = Number(body.userId);
    const movieId = Number(body.movieId);
    const showtimeId = Number(body.showtimeId);
    const numTickets = Number(body.numTickets);
    const ticketPrice = Number(body.ticketPrice);
    const movieName = String(body.movieName || "").trim();

    if (!userId || !movieId || !showtimeId || !movieName || !numTickets || !ticketPrice) {
      return sendJson(response, 400, { message: "Missing required ticket fields." });
    }

    const ticket = {
      id: nextId(dataStore.tickets, "id"),
      user_id: userId,
      movie_id: movieId,
      showtime_id: showtimeId,
      movie_name: movieName,
      numTickets,
      ticketPrice,
      totalCost: numTickets * ticketPrice,
      created_at: new Date().toISOString(),
    };

    dataStore.tickets.push(ticket);
    await saveData();

    return sendJson(response, 201, {
      message: "Ticket booked successfully",
      ticketId: ticket.id,
      totalCost: ticket.totalCost,
    });
  }

  if (request.method === "POST" && pathname === "/api/book") {
    const body = await readRequestBody(request);
    const selectedSeats = Array.isArray(body.selectedSeats) ? body.selectedSeats : [];
    const userId = Number(body.userId);
    const showtimeId = Number(body.showtimeId);
    const totalAmount = Number(body.totalAmount || 0);
    const paymentMethod = String(body.paymentMethod || "Pending");

    if (!userId || !showtimeId || selectedSeats.length === 0) {
      return sendJson(response, 400, {
        error: "User, showtime, and selected seats are required.",
      });
    }

    const seats = dataStore.seats.filter(
      (seat) => seat.showtimeId === showtimeId && selectedSeats.includes(seat.seatNumber)
    );

    if (seats.length !== selectedSeats.length) {
      return sendJson(response, 400, { error: "Some selected seats do not exist." });
    }

    const unavailableSeat = seats.find((seat) => seat.isReserved);
    if (unavailableSeat) {
      return sendJson(response, 409, {
        error: `Seat ${unavailableSeat.seatNumber} is no longer available.`,
      });
    }

    seats.forEach((seat) => {
      seat.isReserved = true;
      seat.userId = userId;
    });

    const booking = {
      bookingId: nextId(dataStore.bookings, "bookingId"),
      userId,
      showtimeId,
      selectedSeats,
      totalAmount,
      bookingDate: new Date().toISOString(),
      paymentMethod,
      paymentStatus: "Pending",
    };

    dataStore.bookings.push(booking);
    await saveData();

    return sendJson(response, 200, {
      message: "Seats reserved successfully.",
      bookingId: booking.bookingId,
    });
  }

  if (request.method === "POST" && pathname === "/api/payment") {
    const body = await readRequestBody(request);
    const bookingId = Number(body.bookingId);
    const userId = Number(body.userId);
    const showtimeId = Number(body.showtimeId);
    const movieName = String(body.movieName || "").trim();
    const numTickets = Number(body.numTickets);
    const ticketCost = Number(body.ticketCost || 0);
    const selectedSeats = Array.isArray(body.selectedSeats) ? body.selectedSeats : [];
    const seatCost = Number(body.seatCost || 0);
    const snacksList = Array.isArray(body.snacksList)
      ? body.snacksList.join(", ")
      : String(body.snacksList || "");
    const snacksCost = Number(body.snacksCost || 0);
    const totalCost = Number(body.totalCost || 0);
    const paymentMethod = String(body.paymentMethod || "").trim();
    const cardholderName = String(body.cardholderName || "").trim();
    const cardNumber = String(body.cardNumber || "").replace(/\s+/g, "");
    const expiryDate = String(body.expiryDate || "").trim();
    const cvv = String(body.cvv || "").trim();
    const bankName = String(body.bankName || "").trim();

    if (
      !bookingId ||
      !userId ||
      !showtimeId ||
      !movieName ||
      !numTickets ||
      selectedSeats.length === 0 ||
      !paymentMethod
    ) {
      return sendJson(response, 400, { success: false, message: "Missing payment details." });
    }

    if (paymentMethod !== "Bank Transfer") {
      if (!cardholderName || !isValidCardNumber(cardNumber) || !isValidExpiryDate(expiryDate)) {
        return sendJson(response, 400, {
          success: false,
          message: "Enter a valid cardholder name, card number, and expiry date.",
        });
      }

      if (!isValidCvv(cvv)) {
        return sendJson(response, 400, {
          success: false,
          message: "Enter a valid CVV.",
        });
      }
    } else if (!bankName) {
      return sendJson(response, 400, {
        success: false,
        message: "Please select a bank for bank transfer.",
      });
    }

    const booking = dataStore.bookings.find((item) => item.bookingId === bookingId);
    if (!booking) {
      return sendJson(response, 404, {
        success: false,
        message: "Booking not found. Please select your seats again.",
      });
    }

    booking.paymentMethod = paymentMethod;
    booking.paymentStatus = "Paid";
    booking.totalAmount = totalCost;

    const payment = {
      payment_id: nextId(dataStore.payments, "payment_id"),
      bookingId,
      user_id: userId,
      showtimeId,
      movie_name: movieName,
      num_tickets: numTickets,
      ticket_cost: ticketCost,
      selected_seats: selectedSeats.join(", "),
      seat_cost: seatCost,
      snacks_list: snacksList,
      snacks_cost: snacksCost,
      total_cost: totalCost,
      payment_method: paymentMethod,
      cardholder_name: cardholderName || null,
      card_last4: cardNumber ? cardNumber.slice(-4) : null,
      expiry_date: expiryDate || null,
      bank_name: bankName || null,
      payment_date: new Date().toISOString(),
    };

    dataStore.payments.push(payment);
    await saveData();

    return sendJson(response, 200, {
      success: true,
      message: "Payment processed successfully.",
      bookingId,
      paymentId: payment.payment_id,
      reference: `CV-${bookingId}-${payment.payment_id}`,
    });
  }

  return sendJson(response, 404, { error: "Route not found." });
}

async function serveStaticFile(response, filePath) {
  try {
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(frontendDir)) {
      return sendText(response, 403, "Forbidden");
    }

    const fileBuffer = await fs.readFile(resolvedPath);
    const extension = path.extname(resolvedPath).toLowerCase();
    const contentType = contentTypes[extension] || "application/octet-stream";

    response.writeHead(200, { "Content-Type": contentType });
    response.end(fileBuffer);
  } catch {
    sendText(response, 404, "Not found");
  }
}

async function handleRequest(request, response) {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname.startsWith("/api/")) {
      return await handleApi(request, response, url);
    }

    const requestedPath =
      url.pathname === "/" ? "/cineverse.html" : decodeURIComponent(url.pathname);
    const filePath = path.join(frontendDir, requestedPath);
    return await serveStaticFile(response, filePath);
  } catch (error) {
    console.error("Unexpected server error:", error);
    return sendJson(response, 500, { error: "Internal server error." });
  }
}

await ensureDataStore();

createServer(handleRequest).listen(port, () => {
  console.log(`CineVerse server is running on http://localhost:${port}`);
});
