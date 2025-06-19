import { useEffect, useState } from "react";
import { uid } from "uid";
import styles from "./RoomsPage.module.css";
import { Link, useNavigate } from "react-router";

const RoomsPage = ({ socket }) => {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate(`/game/${uid()}`);
  };

  useEffect(() => {
    socket.emit("getRooms");
    socket.on("sendAllRooms", (data) => {
      console.log("sendAllRooms", data);
      setRooms(data);
    });
  }, [socket]);

  useEffect(() => {
    if (!localStorage.getItem("user")) navigate("/");
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Добро пожаловать на страницу с комнатами
        </h1>
        <div className={styles.btnContainer}>
          <button
            onClick={() => handleCreateRoom()}
            className={styles.btnCreate}
          >
            Создать комнату
          </button>
        </div>
        <h2 className={styles.titleRooms}>Уже созданные комнаты</h2>
        <div className={styles.listWrapper}>
          <ul className={styles.listContainer}>
            {rooms.map((item, index) => (
              <Link
                style={{ textDecoration: "none", color: "black" }}
                to={`/game/${item.room}`}
              >
                {" "}
                <li
                  style={{ color: "black" }}
                  key={index}
                  className={styles.listItem}
                >
                  Room`s {item.name}
                </li>
              </Link>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;
