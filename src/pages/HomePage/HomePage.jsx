import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const [name, setName] = useState("");
  const formRef = useRef();
  const navigate = useNavigate();

  const onHandleSaveToLocalStorage = () => {
    if (name.length >= 3 && name.length <= 15) {
      localStorage.setItem("user", name);
      navigate("/rooms");
    }
  };

  useEffect(() => {
    setName(localStorage.getItem("user"));
  }, []);

  return (
    <div className={styles.wrapp}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Добро пожаловать на главную страницу морского боя
        </h1>
        {localStorage.getItem("user") ? (
          <div>
            <div>
              <p style={{ color: "#D9D9D9" }}>Вы уже ввели имя пользователя</p>
              <button
                type="button"
                onClick={(e) => {
                  localStorage.removeItem("user");
                  setName("");
                }}
                className={styles.btn}
              >
                Переименовать
              </button>
            </div>
            <div style={{ marginTop: "20px" }}>
              <button onClick={() => navigate("/rooms")} className={styles.btn}>
                Вернуться на страницу с комнатами
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.formContainer}>
            <form ref={formRef} className={styles.form}>
              <label htmlFor="name" className={styles.label}>
                Введите имя пользователя
              </label>
              <input
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
                maxLength={15}
                type="text"
                name="name"
                id="name"
                className={styles.inputName}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (formRef.current.checkValidity()) {
                    onHandleSaveToLocalStorage();
                  } else {
                    formRef.current.reportValidity();
                  }
                }}
                type="submit"
                className={styles.btn}
              >
                Продолжить
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
