import { useEffect, useState } from "react";
import { uid } from "uid";
import styles from "./RoomsPage.module.css";
import { Link, useLocation, useNavigate } from "react-router";
import { notifyRoomIsFull } from "../utils/toastNotify";
import { ToastContainer } from "react-toastify";

const RoomsPage = ({ socket }) => {
  const [rooms, setRooms] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate(`/game/${uid()}`);
  };

  useEffect(() => {
    socket.emit("getRooms");

    socket.on("sendAllRooms", (data) => {
      console.log("Получены комнаты:", data);
      setRooms(data);
    });

    return () => {
      socket.off("sendAllRooms");
    };
  }, [socket]);

  useEffect(() => {
    if (location.state && location.state.roomIsFull) {
      console.log("error");
      notifyRoomIsFull("Комната полная");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!localStorage.getItem("user")) navigate("/");
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.back}>
        <Link className={styles.linkToHome} to={"/"}>
          &#9668;{" "}
          <span className={styles.linkText}>Вернуться на главную страницу</span>
        </Link>
      </div>
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
                key={item.room}
                style={{
                  textDecoration: "none",
                  color: "black",
                }}
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
      <ToastContainer />
    </div>
  );
};

export default RoomsPage;
