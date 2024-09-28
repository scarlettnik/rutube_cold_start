import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import styles from "./interests.module.css";
import { Eye, ThumbsDown, ThumbsUp } from "lucide-react";
import Cookies from "js-cookie";
import { ClockLoader } from "react-spinners";

const Interests = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const PORTION_OF_ITEMS = 10;
  const [token, setToken] = useState("");
  const [votes, setVotes] = useState({});

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

  useEffect(() => {
    const existingVotes = Cookies.get("votes");
    if (existingVotes) {
      setVotes(JSON.parse(existingVotes));
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchPokemons();
    }
  }, [token]);

  const fetchPokemons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://marlin-darling-pipefish.ngrok-free.app/api/v1/recommendations?limit=${PORTION_OF_ITEMS}&offset=${offset}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ user_id: token }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch data");
      }

      const data = await response.json();
      console.log(data);
      if (Array.isArray(data)) {
        setPokemons((prevPokemons) => [...prevPokemons, ...data]);
      } else if (data.results && Array.isArray(data.results)) {
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
      loadMorePokemons();
    }
  }, [offset]);

  const loadMorePokemons = async () => {
    setLoadingMore(true);
    try {
      await fetchPokemons();
    } finally {
      setLoadingMore(false);
    }
  };

  const handleVote = async (video, voteType) => {
    const requestBody = {
      user_id: token,
      video_id: video.id,
      type: voteType,
    };

    try {
      const response = await fetch(
        "https://marlin-darling-pipefish.ngrok-free.app/api/v1/interaction",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Response:", result);

      const newVotes = { ...votes, [video.id]: voteType };
      setVotes(newVotes);
      Cookies.set("votes", JSON.stringify(newVotes), { expires: 365 });
    } catch (error) {
      console.error("Error sending vote:", error);
    }
  };

  function reformatToReadableDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    const screenWidth = window.innerWidth;

    if (screenWidth >= 1200 && screenWidth <= 1600) {
      return `${hours}:${minutes} ${day}/${month}`;
    } else {
      const year = date.getUTCFullYear();
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    }
  }

  const getVoteColor = (videoId, voteType) => {
    return votes[videoId] === voteType
      ? voteType === "like"
        ? "green"
        : "red"
      : "gray";
  };

  return (
    <div>
      {error && <p>{error}</p>}
      <div className={styles.container}>
        {pokemons.map((video) => (
          <div className={styles.block} key={video.id}>
            <div className={styles.title}>{video?.title}</div>
            <div className={styles.description}>
              {video?.description || "Описание не добавлено"}
            </div>
            <div className={styles.view}>
              <Eye size={20} color="blueviolet" />
              {video?.year_views}
            </div>
            <div className={styles.underline}>
              <div className={styles.publicdate}>
                {reformatToReadableDate(video?.publication_datetime)}
              </div>
              <div className={styles.category}>
                <div className={styles.undercategory}>{video?.category}</div>
              </div>
              <div className={styles.reactons}>
                <button
                  style={{ marginRight: "1em" }}
                  className={styles.reaction}
                  onClick={() => handleVote(video, "like")}
                >
                  <ThumbsUp color={getVoteColor(video.id, "like")} />
                </button>
                <button
                  style={{ marginLeft: "1em" }}
                  className={styles.reaction}
                  onClick={() => handleVote(video, "dislike")}
                >
                  <ThumbsDown color={getVoteColor(video.id, "dislike")} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {loading && (
        <div className={styles.loader}>
          <ClockLoader className={styles.loadicon} color="#b1b3b3" />
        </div>
      )}
      {!loading && pokemons.length > 0 && (
        <div className={styles.addbutton}>
          <button
            className={styles.addmore}
            onClick={() => setOffset((prev) => prev + PORTION_OF_ITEMS)}
          >
            Посмотреть еще
          </button>
        </div>
      )}
    </div>
  );
};

export default Interests;
