create table NowShowing (
id int primary key identity(1,1),
title varchar(255) not null,
image varchar(max) not null,
book_Now varchar(255) not null
)

create table comingSoon (
id int primary key identity(1,1),
title varchar(255) not null,      
image varchar(max) not null,
release_date date not null,   
);

insert into NowShowing (title, image, book_now) VALUES
('Inception', 'https://i.ebayimg.com/images/g/G~EAAOSwAUBd5E7b/s-l960.webp', 'movie-details.html?movie=Inception'),
('Spider-Man: No Way Home', 'https://cdn.marvel.com/content/1x/spider-mannowayhome_lob_crd_03.jpg', 'movie-details.html?movie=Spider-Man: No Way Home'),
('The Conjuring 4', 'https://static1.srcdn.com/wordpress/wp-content/uploads/2023/09/the-conjuring-universe-poster.jpg', 'movie-details.html?movie=The Conjuring 4'),
('Jurassic World', 'https://c8.alamy.com/comp/2JE347Y/movie-poster-jurassic-world-2015-2JE347Y.jpg', 'movie-details.html?movie=Jurassic World');

insert into ComingSoon (title, image, release_date) VALUES
('Venom: The Last Dance', 'https://cdn1.clickthecity.com/images/movies/poster/400/19823_3.jpg', '2025-01-12'),
('Captain America: Brave New World','https://preview.redd.it/official-poster-for-captain-america-brave-new-world-v0-xyr7di8f63cd1.jpeg?auto=webp&s=19ce30e86c98577cc214ee7b24a8ca0d4ab0f054.jpg', '2025-03-07');

insert into NowShowing (title, image, book_now) VALUES
('Inception', 'https://i.ebayimg.com/images/g/G~EAAOSwAUBd5E7b/s-l960.webp', 'movie-details.html?movie=Inception')

select * from NowShowing;
select* from comingSoon

--table for movies
create table Movie (
    movie_id int primary key identity(1,1),
    title varchar(255) not null,              
    description text not null,               
    image  varchar(255) not null,         
    ageRating varchar(10) not null,          
    moreDetails varchar(255) not null,  
    created_at datetime default getdate(),
    updated_at datetime default getdate()
);

insert into Movie (title, description, image, ageRating, moreDetails) values
('Inception', 'A skilled thief, the absolute best in the dangerous art of extraction, stealing valuable secrets from deep within the subconscious during the dream state.',
 'https://i.ebayimg.com/images/g/G~EAAOSwAUBd5E7b/s-l960.webp', '13+', 'movie-details.html?movie=Inception'),

('Spider-Man: No Way Home', 'Peter Parker faces a crisis as villains from multiple realities descend upon New York City. Can he stop them all?',
 'https://cdn.marvel.com/content/1x/spider-mannowayhome_lob_crd_03.jpg', '12+', 'movie-details.html?movie=Spider-Man: No Way Home'),

('The Conjuring 4', 'Ed and Lorraine Warren return to confront their most terrifying case yet in this haunting thriller.',
 'https://static1.srcdn.com/wordpress/wp-content/uploads/2023/09/the-conjuring-universe-poster.jpg', '18+', 'movie-details.html?movie=The Conjuring 4'),

('Jurassic World', 'An epic adventure set in a dinosaur theme park, where chaos ensues when the genetically engineered Indominus rex escapes containment.',
 'https://c8.alamy.com/comp/2JE347Y/movie-poster-jurassic-world-2015-2JE347Y.jpg', '10+', 'movie-details.html?movie=Jurassic World');

 select* from Movie

 --table for movieDetails
create table MovieDetails (
movie_detail_id int primary key identity(1,1),  
movie_id int,                                   
description text,                                  
director varchar(255),                        
cast text,                                      
duration int,                                    
genre varchar(255),                             
trailer_url varchar(255),                       
release_date date,                             
foreign key (movie_id) references Movie(movie_id)  
);

-- Insert movie details for Inception (movie_id = 1)
insert into MovieDetails (movie_id, description, director, cast, duration, genre, trailer_url, release_date) values 
(1, 'A skilled thief, the absolute best in the dangerous art of extraction, stealing valuable secrets from deep within the subconscious during the dream state.',
 'Christopher Nolan', 'Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page', 148, 'Action, Sci-Fi', 'https://www.youtube.com/watch?v=YoHD9XEInc0', '2010-07-16');

-- Insert movie details for Spider-Man: No Way Home (movie_id = 2)
insert into MovieDetails (movie_id, description, director, cast, duration, genre, trailer_url, release_date) values 
(2, 'Peter Parker faces a crisis as villains from multiple realities descend upon New York City. Can he stop them all?',
 'Jon Watts', 'Tom Holland, Zendaya, Benedict Cumberbatch', 148, 'Action, Adventure, Sci-Fi', 'https://www.youtube.com/watch?v=JfVOs4V8pDU', '2021-12-17');

-- Insert movie details for The Conjuring 4 (movie_id = 3)
insert into MovieDetails (movie_id, description, director, cast, duration, genre, trailer_url, release_date) values 
(3, 'Ed and Lorraine Warren return to confront their most terrifying case yet in this haunting thriller.',
 'Michael Chaves', 'Patrick Wilson, Vera Farmiga, Ruairi O’Connor', 132, 'Horror, Thriller', 'https://www.youtube.com/watch?v=ZBdHFJ_fXqg', '2023-09-08');

-- Insert movie details for Jurassic World (movie_id = 4)
insert into MovieDetails (movie_id, description, director, cast, duration, genre, trailer_url, release_date) values 
(4, 'An epic adventure set in a dinosaur theme park, where chaos ensues when the genetically engineered Indominus rex escapes containment.',
 'Colin Trevorrow', 'Chris Pratt, Bryce Dallas Howard, Vincent D\ Onofrio', 124, 'Action, Adventure, Sci-Fi', 'https://www.youtube.com/watch?v=RFinNxS5P8E', '2015-06-12');


 select * from MovieDetails;
 select* from Movie;
--User table
create table Users (
userid int primary key identity(1,1),        
firstName varchar(50) not null,             
lastName varchar(50) not null,              
birthday date not null,                     
gender char(6) not null check (gender in ('Male', 'Female', 'Other')), 
maritalStatus char(7) not null check (maritalstatus in ('Single', 'Married', 'Other')), 
email varchar(50) not null unique,          
phoneNo varchar(11),                        
address varchar(255),                       
city varchar(100),                          
postcode varchar(10) not null,              
password varchar(255) not null,         
agreeToTerms bit not null default 0,        
createdAt datetime default getdate() not null 
);

select * from users

--ratings table
create table MovieRatings (
movie_title varchar(255),
rating int,
user_id int,
primary key (movie_title, user_id),
foreign key (user_id) references Users(userid) 
);

insert into MovieRatings (movie_title,rating,user_id) values
('Inception','9','1')

select* from MovieRatings

 --ShowTimes Table
create table showtimes (
id int primary key identity(1,1),
movie_id int not null,  
show_date date not null,
show_time time not null,
showType varchar(255) not null,
foreign key (movie_id) references Movie(movie_id)  
);

-- Insertion of showtimes for Inception (movie_id = 1)
insert into showtimes (movie_id, show_date, show_time, showType) values
    (1, '2024-10-25', '03:30:00', 'MAXIMUS'),
    (1, '2024-10-25', '05:45:00', 'MAXIMUS'),
    (1, '2024-10-25', '08:00:00', 'PLATINUM'),
    (1, '2024-10-25', '10:15:00', 'PLATINUM'),
    (1, '2024-10-25', '12:30:00', 'PLATINUM'),
    (1, '2024-10-26', '12:00:00', 'MAXIMUS'),
    (1, '2024-10-26', '06:45:00', 'PLATINUM'),
    (1, '2024-10-26', '11:30:00', 'PLATINUM'),
    (1, '2024-10-27', '12:00:00', 'MAXIMUS'),
    (1, '2024-10-27', '06:45:00', 'PLATINUM'),
    (1, '2024-10-27', '11:30:00', 'PLATINUM'),

-- Insertion of showtimes for Spider-Man: No Way Home (movie_id = 2)
    (2, '2024-10-25', '03:30:00', 'MAXIMUS'),
    (2, '2024-10-25', '05:45:00', 'MAXIMUS'),
    (2, '2024-10-25', '08:00:00', 'PLATINUM'),
    (2, '2024-10-25', '10:15:00', 'PLATINUM'),
    (2, '2024-10-25', '12:30:00', 'PLATINUM'),
    (2, '2024-10-26', '12:00:00', 'MAXIMUS'),
    (2, '2024-10-26', '06:45:00', 'PLATINUM'),
    (2, '2024-10-26', '11:30:00', 'PLATINUM'),
    (2, '2024-10-27', '12:00:00', 'MAXIMUS'),
    (2, '2024-10-27', '06:45:00', 'PLATINUM'),
    (2, '2024-10-27', '11:30:00', 'PLATINUM'),

-- Insertion of showtimes for The Conjuring 4 (movie_id = 3)
    (3, '2024-10-25', '03:30:00', 'MAXIMUS'),
    (3, '2024-10-25', '05:45:00', 'MAXIMUS'),
    (3, '2024-10-25', '08:00:00', 'PLATINUM'),
    (3, '2024-10-25', '10:15:00', 'PLATINUM'),
    (3, '2024-10-25', '12:30:00', 'PLATINUM'),
    (3, '2024-10-26', '12:00:00', 'MAXIMUS'),
    (3, '2024-10-26', '06:45:00', 'PLATINUM'),
    (3, '2024-10-26', '11:30:00', 'PLATINUM'),
    (3, '2024-10-27', '12:00:00', 'MAXIMUS'),
    (3, '2024-10-27', '06:45:00', 'PLATINUM'),
    (3, '2024-10-27', '11:30:00', 'PLATINUM'),

-- Insertion of showtimes for Jurassic World (movie_id = 4)
    (4, '2024-10-25', '03:30:00', 'MAXIMUS'),
    (4, '2024-10-25', '05:45:00', 'MAXIMUS'),
    (4, '2024-10-25', '08:00:00', 'PLATINUM'),
    (4, '2024-10-25', '10:15:00', 'PLATINUM'),
    (4, '2024-10-25', '12:30:00', 'PLATINUM'),
    (4, '2024-10-26', '12:00:00', 'MAXIMUS'),
    (4, '2024-10-26', '06:45:00', 'PLATINUM'),
    (4, '2024-10-26', '11:30:00', 'PLATINUM'),
    (4, '2024-10-27', '12:00:00', 'MAXIMUS'),
    (4, '2024-10-27', '06:45:00', 'PLATINUM'),
    (4, '2024-10-27', '11:30:00', 'PLATINUM');

	select* from showtimes
	select* from MovieDetails

--table for tickets
create table tickets (
    id int primary key identity(1,1) ,
    user_id int not null,
    movie_name varchar(255) not null,
    numTickets int not null,
    ticketPrice decimal(10, 2) not null,
    totalCost decimal(10, 2) not null,
    created_at datetime default getdate(),
    foreign key (user_id) references users(user_id)
);

select* from tickets

--table for seats
create table Seats (
    userId int,
    seatId int primary key identity(1,1),
    showtimeId int foreign key references Showtimes(id),
    seatNumber varchar(10),
    isReserved bit default 0,
    seatType nvarchar(50)
);

-- Insert seats for Platinum 
insert into Seats (showtimeId, seatNumber, isReserved, seatType)
values
(1, 'A1', 0, 'Platinum'),
(1, 'A2', 0, 'Platinum'),
(1, 'A3', 0, 'Platinum'),
(1, 'A4', 0, 'Platinum'),
(1, 'A5', 0, 'Platinum'),
(1, 'A6', 0, 'Platinum'),
(1, 'A7', 0, 'Platinum'),
(1, 'B1', 0, 'Platinum'),
(1, 'B2', 0, 'Platinum'),
(1, 'B3', 0, 'Platinum'),
(1, 'B4', 0, 'Platinum'),
(1, 'B5', 0, 'Platinum'),
(1, 'B6', 0, 'Platinum'),
(1, 'B7', 0, 'Platinum'),
(1, 'C1', 0, 'Platinum'),
(1, 'C2', 0, 'Platinum'),
(1, 'C3', 0, 'Platinum'),
(1, 'C4', 0, 'Platinum'),
(1, 'C5', 0, 'Platinum'),
(1, 'C6', 0, 'Platinum'),
(1, 'C7', 0, 'Platinum'),
(1, 'D1', 0, 'Platinum'),
(1, 'D2', 0, 'Platinum'),
(1, 'D3', 0, 'Platinum'),
(1, 'D4', 0, 'Platinum'),
(1, 'D5', 0, 'Platinum'),
(1, 'D6', 0, 'Platinum'),
(1, 'D7', 0, 'Platinum');

-- Insert seats for Maximus (showtimeId = 2)
insert into Seats (showtimeId, seatNumber, isReserved, seatType)
values
(2, 'A1', 0, 'Maximus'),
(2, 'A2', 0, 'Maximus'),
(2, 'A3', 0, 'Maximus'),
(2, 'A4', 0, 'Maximus'),
(2, 'A5', 0, 'Maximus'),
(2, 'A6', 0, 'Maximus'),
(2, 'A7', 0, 'Maximus'),
(2, 'B1', 0, 'Maximus'),
(2, 'B2', 0, 'Maximus'),
(2, 'B3', 0, 'Maximus'),
(2, 'B4', 0, 'Maximus'),
(2, 'B5', 0, 'Maximus'),
(2, 'B6', 0, 'Maximus'),
(2, 'B7', 0, 'Maximus'),
(2, 'C1', 0, 'Maximus'),
(2, 'C2', 0, 'Maximus'),
(2, 'C3', 0, 'Maximus'),
(2, 'C4', 0, 'Maximus'),
(2, 'C5', 0, 'Maximus'),
(2, 'C6', 0, 'Maximus'),
(2, 'C7', 0, 'Maximus'),
(2, 'D1', 0, 'Maximus'),
(2, 'D2', 0, 'Maximus'),
(2, 'D3', 0, 'Maximus'),
(2, 'D4', 0, 'Maximus'),
(2, 'D5', 0, 'Maximus'),
(2, 'D6', 0, 'Maximus'),
(2, 'D7', 0, 'Maximus');


--table for bookings
create table Bookings (
    bookingId int primary key identity(1,1),
    userId int foreign key references Users(user_id),
    showtimeId int foreign key references Showtimes(id),
    totalAmount decimal(10, 2),
    bookingDate datetime default getdate(),
    paymentMethod varchar(50),
    paymentStatus varchar(50)
);

create trigger beforeInsertBooking
on Bookings
instead of insert
as
begin
   
declare @userId int;
declare @showtimeId int;
declare @totalAmount decimal(10, 2);
declare @paymentMethod varchar(50);
declare @paymentStatus varchar(50);

select @userId = userId,
@showtimeId = showtimeId,
@totalAmount = totalAmount,
@paymentMethod = paymentMethod,
@paymentStatus = paymentStatus
from inserted;

declare @selectedSeats table (seatNumber varchar(10));

update s
set s.isReserved = 1,  
s.userId = @userId 
from Seats s
join @selectedSeats ss on s.seatNumber = ss.seatNumber
where s.showtimeId = @showtimeId
and s.isReserved = 0; 

insert into Bookings (userId, showtimeId, totalAmount, paymentMethod, paymentStatus)
select @userId, @showtimeId, @totalAmount, @paymentMethod, @paymentStatus
from inserted;
end;

select * from Seats where isReserved = 1;

--truncate table seats
--DELETE FROM Seats;
--DBCC CHECKIDENT ('Seats', RESEED, 0);  
--drop trigger if exists beforeInsertBooking

-- payment table
create table payments (
    payment_id int identity(1,1) primary key,
    movie_name varchar(255) not null,
    num_tickets int not null,
    ticket_cost decimal(10, 2) not null,
    selected_seats varchar(max) not null,
    seat_cost decimal(10, 2) not null,
    snacks_list varchar(max),
    snacks_cost decimal(10, 2),
    total_cost decimal(10, 2) not null,
    payment_method varchar(50) not null,
    cardholder_name varchar(255),
    card_number varchar(20),
    expiry_date varchar(10),
    cvv varchar(4),
    bank_name varchar(255),
    payment_date datetime default getdate()
);

select*from payments
