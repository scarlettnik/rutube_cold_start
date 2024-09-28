import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import styles from "./interests.module.css";
import { Eye, ThumbsDown, ThumbsUp } from 'lucide-react';
import Cookies from "js-cookie";

const Interests = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const PORTION_OF_ITEMS = 10;
  const [token, setToken] = useState("");

  // Генерация или получение UUID из куки
  useEffect(() => {
    const existingToken = Cookies.get("userToken");
    if (!existingToken) {
      const newToken = uuidv4();
      Cookies.set("userToken", newToken, { expires: 365 });
      setToken(newToken);
    } else {
      setToken(existingToken);
    }
  }, []);

  // Запрос покемонов, будет выполнен только после установки токена
  useEffect(() => {
    if (token) {
      fetchPokemons();
    }
  }, [token]); // Зависимость от token

  const fetchPokemons = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching pokemons with token:", token);
      const response = await fetch(
        `https://marlin-darling-pipefish.ngrok-free.app/api/v1/recommendations?limit=${PORTION_OF_ITEMS}&offset=${offset}`, {
          method: 'POST', 
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
          },
          body: JSON.stringify({ user_id: token }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch data");
      }

      const data = await response.json();
      console.log(data)
      if (Array.isArray(data.results)) {
        setPokemons((prevPokemons) => [...prevPokemons, ...data.results]);
      } else {
        throw new Error("Unexpected data format: results is not an array");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch pokemons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (offset > 0) {
      fetchPokemons();
    }
  }, [offset]);

  const handleVote = async (pokemon, voteType) => {
    const requestBody = {
      user_id: token,
      video_id: token, // Убедитесь, что это правильное поле
      type: voteType,
    };

    console.log("Request Body:", requestBody);

    try {
      const response = await fetch("https://marlin-darling-pipefish.ngrok-free.app/api/v1/interaction", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Response:", result);
    } catch (error) {
      console.error("Error sending vote:", error);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div className={styles.container}>
        {pokemons.map((pokemon, index) => (
          <div className={styles.block} key={index}>
            <div className={styles.title}>{pokemon.name}</div>
            <div className={styles.description}>
              Description for {pokemon.name}
            </div>
            <div className={styles.view}><Eye size={20} /> view</div>
            <div className={styles.publicdate}>public date</div>
            <div className={styles.category}>category</div>
            <div>
              <button className={styles.reaction} onClick={() => handleVote(pokemon, 'like')}><ThumbsUp color='green' /></button>
              <button className={styles.reaction} onClick={() => handleVote(pokemon, 'dislike')}><ThumbsDown color="red" /></button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setOffset((prev) => prev + PORTION_OF_ITEMS)}>
        Load More
      </button>
    </div>
  );
};

export default Interests;