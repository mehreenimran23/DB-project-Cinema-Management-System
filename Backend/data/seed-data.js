const rows = ["A", "B", "C", "D"];
const seatsPerRow = 7;

function addDays(baseDate, offset) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildShowtimes(movieCount, cinemas) {
  const today = new Date();
  const schedule = [
    { dayOffset: 0, times: ["13:00", "16:15", "19:30"] },
    { dayOffset: 1, times: ["12:30", "15:45", "20:00"] },
    { dayOffset: 2, times: ["11:45", "17:00", "21:15"] },
  ];

  const showtimes = [];
  let id = 1;

  cinemas.forEach((cinema, cinemaIndex) => {
    for (let movieId = 1; movieId <= movieCount; movieId += 1) {
      schedule.forEach(({ dayOffset, times }, scheduleIndex) => {
        times.forEach((time, timeIndex) => {
          const showType = timeIndex === 1 ? "PLATINUM" : "MAXIMUS";
          const premiumScreen = cinemaIndex % 2 === 0 ? "Platinum Lounge" : "Royal Screen";
          const standardScreen = cinemaIndex % 2 === 0 ? "Maximus Hall" : "Grand Hall";
          showtimes.push({
            id,
            movie_id: movieId,
            cinemaId: cinema.id,
            cinemaName: cinema.name,
            screenName: showType === "PLATINUM" ? premiumScreen : standardScreen,
            show_date: addDays(today, dayOffset),
            show_time: time,
            showType,
          });
          id += 1;
        });
      });
    }
  });

  return showtimes;
}

function buildSeats(showtimes) {
  let seatId = 1;

  return showtimes.flatMap((showtime) => {
    const reservedSeats = new Set(
      showtime.id % 2 === 0 ? ["A3", "B5", "C2"] : ["A5", "B1", "D6"]
    );

    return rows.flatMap((row) => {
      const seatType = showtime.showType === "PLATINUM" ? "Platinum" : "Maximus";

      return Array.from({ length: seatsPerRow }, (_, index) => {
        const seatNumber = `${row}${index + 1}`;

        return {
          seatId: seatId++,
          userId: reservedSeats.has(seatNumber) ? 1 : null,
          showtimeId: showtime.id,
          seatNumber,
          isReserved: reservedSeats.has(seatNumber),
          seatType,
        };
      });
    });
  });
}

function buildMoreDetailsLink(title) {
  return `movie-details.html?movie=${encodeURIComponent(title)}`;
}

export function createSeedData() {
  const cinemas = [
    {
      id: 1,
      name: "CineVerse Gulberg",
      city: "Lahore",
      location: "MM Alam Road, Gulberg III, Lahore",
      phone: "+92 42 3579 4401",
      hours: "11:00 AM - 01:00 AM",
      parking: "Valet and adjacent paid parking available after 5 PM.",
      landmark: "Near Main Boulevard and Liberty Roundabout",
      experience: "Boutique luxury cinema with quieter lounges and premium recliners.",
      mapQuery: "MM Alam Road Gulberg III Lahore",
      formats: ["Maximus", "Platinum"],
      features: ["Maximus Screen", "Premium Recliners", "Family Lounge"],
    },
    {
      id: 2,
      name: "CineVerse Packages",
      city: "Lahore",
      location: "Packages Mall, Walton Road, Lahore",
      phone: "+92 42 3810 1155",
      hours: "10:30 AM - 01:15 AM",
      parking: "Covered mall parking with direct lobby access.",
      landmark: "Packages Mall main atrium entrance",
      experience: "Flagship mall cinema with late shows, premium food counters, and family-friendly access.",
      mapQuery: "Packages Mall Walton Road Lahore",
      formats: ["Maximus", "Platinum"],
      features: ["Mall Access", "Late Shows", "Luxury Snacks"],
    },
  ];

  const movies = [
    {
      movie_id: 1,
      title: "Inception",
      description:
        "A skilled thief enters dreams to steal impossible secrets and gets one last chance at redemption.",
      image: "https://i.ebayimg.com/images/g/G~EAAOSwAUBd5E7b/s-l960.webp",
      ageRating: "13+",
      moreDetails: buildMoreDetailsLink("Inception"),
    },
    {
      movie_id: 2,
      title: "Spider-Man: No Way Home",
      description:
        "Peter Parker faces a multiverse crisis when old villains collide with his present.",
      image:
        "https://cdn.marvel.com/content/1x/spider-mannowayhome_lob_crd_03.jpg",
      ageRating: "12+",
      moreDetails: buildMoreDetailsLink("Spider-Man: No Way Home"),
    },
    {
      movie_id: 3,
      title: "The Nun II",
      description:
        "A dark evil rises again as Sister Irene returns to face a terrifying force.",
      image:
        "https://m.media-amazon.com/images/M/MV5BNDM5OGM0OWMtYTAxZi00OWQ2LWE0NzctMzk4NDQwNjU2M2I0XkEyXkFqcGc@._V1_.jpg",
      ageRating: "18+",
      moreDetails: buildMoreDetailsLink("The Nun II"),
    },
    {
      movie_id: 4,
      title: "Jurassic World",
      description:
        "Chaos erupts in a dinosaur theme park when a dangerous new creature breaks free.",
      image:
        "https://c8.alamy.com/comp/2JE347Y/movie-poster-jurassic-world-2015-2JE347Y.jpg",
      ageRating: "10+",
      moreDetails: buildMoreDetailsLink("Jurassic World"),
    },
    {
      movie_id: 5,
      title: "Avengers: Endgame",
      description:
        "The Avengers unite for a final stand to reverse the fallout of their greatest defeat.",
      image:
        "https://m.media-amazon.com/images/M/MV5BMTc5MDY3NTQ0OV5BMl5BanBnXkFtZTgwNzY1NzE3NzM@._V1_FMjpg_UX1000_.jpg",
      ageRating: "13+",
      moreDetails: buildMoreDetailsLink("Avengers: Endgame"),
    },
    {
      movie_id: 6,
      title: "Interstellar",
      description:
        "Explorers travel beyond our galaxy to search for a future home as time begins to work against them.",
      image:
        "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDUtNjM4Yy00MzM5LTkzNDMtODQ0YTFhOGE5M2M4XkEyXkFqcGc@._V1_.jpg",
      ageRating: "10+",
      moreDetails: buildMoreDetailsLink("Interstellar"),
    },
  ];

  const movieDetails = [
    {
      movie_id: 1,
      description:
        "A skilled thief, the absolute best in the dangerous art of extraction, is given a chance to erase his past by planting an idea instead of stealing one.",
      director: "Christopher Nolan",
      cast: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
      duration: 148,
      genre: "Action, Sci-Fi",
      trailer_url: "https://www.youtube.com/watch?v=YoHD9XEInc0",
      release_date: "2010-07-16",
    },
    {
      movie_id: 2,
      description:
        "Peter Parker asks for help after his identity is exposed, only to unleash visitors from other universes.",
      director: "Jon Watts",
      cast: "Tom Holland, Zendaya, Benedict Cumberbatch",
      duration: 148,
      genre: "Action, Adventure, Sci-Fi",
      trailer_url: "https://www.youtube.com/watch?v=JfVOs4V8pDU",
      release_date: "2021-12-17",
    },
    {
      movie_id: 3,
      description:
        "A chilling supernatural sequel where every clue leads deeper into a demonic mystery.",
      director: "Michael Chaves",
      cast: "Taissa Farmiga, Jonas Bloquet, Storm Reid",
      duration: 110,
      genre: "Horror, Thriller",
      trailer_url: "https://www.youtube.com/watch?v=QF-oyCwaArU",
      release_date: "2023-09-08",
    },
    {
      movie_id: 4,
      description:
        "A luxury dinosaur resort turns into a survival nightmare when science goes too far.",
      director: "Colin Trevorrow",
      cast: "Chris Pratt, Bryce Dallas Howard, Vincent D'Onofrio",
      duration: 124,
      genre: "Action, Adventure, Sci-Fi",
      trailer_url: "https://www.youtube.com/watch?v=RFinNxS5P8E",
      release_date: "2015-06-12",
    },
    {
      movie_id: 5,
      description:
        "After the snap devastates the universe, the remaining Avengers regroup for a final mission that could change everything.",
      director: "Anthony Russo, Joe Russo",
      cast: "Robert Downey Jr., Chris Evans, Scarlett Johansson",
      duration: 181,
      genre: "Action, Adventure, Superhero",
      trailer_url: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
      release_date: "2019-04-26",
    },
    {
      movie_id: 6,
      description:
        "A desperate mission through a collapsing Earth sends a team of astronauts toward an uncertain future among the stars.",
      director: "Christopher Nolan",
      cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
      duration: 169,
      genre: "Adventure, Drama, Sci-Fi",
      trailer_url: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
      release_date: "2014-11-07",
    },
  ];

  const comingSoon = [
    {
      id: 1,
      title: "Jurassic World Rebirth",
      image: "",
      release_date: addDays(new Date(), 15),
      link: "https://www.universalstudios.com/videos/jan5CFWs9ic",
    },
    {
      id: 2,
      title: "The Fantastic Four: First Steps",
      image: "",
      release_date: addDays(new Date(), 32),
      link: "https://www.marvel.com/movies/the-fantastic-four-first-steps",
    },
    {
      id: 3,
      title: "Superman",
      image: "",
      release_date: addDays(new Date(), 48),
      link: "https://www.dc.com/movies/superman",
    },
  ];

  const nowShowing = movies.map((movie, index) => ({
    id: index + 1,
    title: movie.title,
    image: movie.image,
    book_now: movie.moreDetails,
  }));

  const showtimes = buildShowtimes(movies.length, cinemas);
  const seats = buildSeats(showtimes);

  return {
    cinemas,
    nowShowing,
    comingSoon,
    movies,
    movieDetails,
    users: [
      {
        user_id: 1,
        first_name: "Demo",
        last_name: "User",
        dob_month: 1,
        dob_day: 1,
        dob_year: 2000,
        gender: "other",
        marital_status: "single",
        email: "demo@cineverse.com",
        phoneNo: "03000000000",
        address: "CineVerse Street",
        postcode: "54000",
        city: "Lahore",
        password: "demo123",
        terms_accepted: true,
        created_at: new Date().toISOString(),
      },
    ],
    ratings: [
      { movie_title: "Inception", rating: 5, user_id: 1 },
      { movie_title: "Spider-Man: No Way Home", rating: 4, user_id: 1 },
      { movie_title: "The Nun II", rating: 4, user_id: 1 },
      { movie_title: "Jurassic World", rating: 4, user_id: 1 },
      { movie_title: "Avengers: Endgame", rating: 5, user_id: 1 },
      { movie_title: "Interstellar", rating: 5, user_id: 1 },
    ],
    showtimes,
    seats,
    tickets: [],
    bookings: [],
    payments: [],
  };
}
