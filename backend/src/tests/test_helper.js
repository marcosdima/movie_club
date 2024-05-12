const exampleMovies = () => ([
    {
        title: "The Shawshank Redemption",
        director: "Frank Darabont",
        description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        genres: ["Drama"],
        imageUrl: "https://upload.wikimedia.org/wikipedia/en/8/81/ShawshankRedemptionMoviePoster.jpg"
    },
    {
        title: "The Godfather",
        director: "Francis Ford Coppola",
        description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
        genres: ["Crime", "Drama"],
        imageUrl: "https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg"
    },
    {
        title: "Pulp Fiction",
        director: "Quentin Tarantino",
        description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        genres: ["Crime", "Drama"],
        imageUrl: "https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg"
    },
    {
        title: "The Matrix",
        director: "Lana Wachowski, Lilly Wachowski",
        description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
        genres: ["Action", "Sci-Fi"],
        imageUrl: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg"
    }
]);

const rootData = () => ({
    username: 'root',
    name: 'Marcos',
    lastname: 'Tester',
    password: 'root'
})



module.exports = {
    exampleMovies,
    rootData,
}