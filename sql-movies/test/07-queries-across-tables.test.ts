import { Database } from "../src/database";
import { DIRECTORS, GENRES, KEYWORDS, MOVIES, MOVIE_DIRECTORS, MOVIE_GENRES, MOVIE_KEYWORDS, MOVIE_RATINGS } from "../src/table-names";
import { minutes } from "./utils";

describe("Queries Across Tables", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("06", "07");
  }, minutes(3));

  it(
    "should select top three directors ordered by total budget spent in their movies",
    async done => {
      const query = `SELECT 
        ${DIRECTORS}.full_name AS director,
        ROUND(SUM(${MOVIES}.budget_adjusted), 2) AS total_budget
      FROM
        ${MOVIES}
      INNER JOIN ${MOVIE_DIRECTORS} ON ${MOVIE_DIRECTORS}.movie_id = ${MOVIES}.id 
      INNER JOIN ${DIRECTORS} ON ${DIRECTORS}.id = ${MOVIE_DIRECTORS}.director_id 
      GROUP BY director 
      ORDER BY total_budget DESC 
      LIMIT 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          director: "Ridley Scott",
          total_budget: 722882143.58
        },
        {
          director: "Michael Bay",
          total_budget: 518297522.1
        },
        {
          director: "David Yates",
          total_budget: 504100108.5
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top 10 keywords ordered by their appearance in movies",
    async done => {
      const query = `SELECT 
        ${KEYWORDS}.keyword as keyword,
        COUNT(*) as count 
        FROM ${MOVIE_KEYWORDS} 
        INNER JOIN ${KEYWORDS} ON ${KEYWORDS}.id = ${MOVIE_KEYWORDS}.keyword_id 
        GROUP BY keyword 
        ORDER BY count DESC 
        LIMIT 10`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          keyword: "woman director",
          count: 162
        },
        {
          keyword: "independent film",
          count: 115
        },
        {
          keyword: "based on novel",
          count: 85
        },
        {
          keyword: "duringcreditsstinger",
          count: 82
        },
        {
          keyword: "biography",
          count: 78
        },
        {
          keyword: "murder",
          count: 66
        },
        {
          keyword: "sex",
          count: 60
        },
        {
          keyword: "revenge",
          count: 51
        },
        {
          keyword: "sport",
          count: 50
        },
        {
          keyword: "high school",
          count: 48
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select all movies called Life and return amount of actors",
    async done => {
      const query = `SELECT original_title, COUNT(*) as count FROM movies 
        INNER JOIN movie_actors ON movie_actors.movie_id = movies.id
        INNER JOIN actors ON actors.id = movie_actors.actor_id 
        WHERE original_title = 'Life'`;
      const result = await db.selectSingleRow(query);

      expect(result).toEqual({
        original_title: "Life",
        count: 12
      });

      done();
    },
    minutes(3)
  );

  it(
    "should select three genres which has most ratings with 5 stars",
    async done => {
      const query = `SELECT 
        ${GENRES}.genre AS genre,
        COUNT(*) AS five_stars_count
      FROM 
        ${MOVIES}
      INNER JOIN ${MOVIE_GENRES} ON ${MOVIE_GENRES}.movie_id = ${MOVIES}.id
      INNER JOIN ${GENRES} ON ${GENRES}.id = ${MOVIE_GENRES}.genre_id 
      INNER JOIN ${MOVIE_RATINGS} ON ${MOVIE_RATINGS}.movie_id = ${MOVIES}.id 
      WHERE ${MOVIE_RATINGS}.rating = 5
      GROUP BY ${GENRES}.genre
      ORDER BY COUNT(*) DESC
      LIMIT 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Drama",
          five_stars_count: 15052
        },
        {
          genre: "Thriller",
          five_stars_count: 11771
        },
        {
          genre: "Crime",
          five_stars_count: 8670
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three genres ordered by average rating",
    async done => {
      const query = `SELECT 
        ${GENRES}.genre AS genre,
        ROUND(AVG(${MOVIE_RATINGS}.rating), 2) AS avg_rating
      FROM 
        movies
      INNER JOIN ${MOVIE_GENRES} ON ${MOVIE_GENRES}.movie_id = ${MOVIES}.id
      INNER JOIN ${GENRES} ON ${GENRES}.id = ${MOVIE_GENRES}.genre_id 
      INNER JOIN ${MOVIE_RATINGS} ON ${MOVIE_RATINGS}.movie_id = ${MOVIES}.id 
      GROUP BY genre
      ORDER BY avg_rating DESC
      LIMIT 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Crime",
          avg_rating: 3.79
        },
        {
          genre: "Music",
          avg_rating: 3.73
        },
        {
          genre: "Documentary",
          avg_rating: 3.71
        }
      ]);

      done();
    },
    minutes(3)
  );
});
