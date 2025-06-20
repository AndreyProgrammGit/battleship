import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { CSSTransition } from "react-transition-group";

import "./Modal.scss";
import "./animated.css";

const styleWrapper = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0, 0, 0, 0.5)",
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  zIndex: 1000,
};

const Modal = ({ showModal, setShowModal }) => {
  const navigate = useNavigate();
  const modalContentRef = useRef(null);

  return (
    <>
      <div
        className="modal-wrapper"
        style={showModal ? styleWrapper : {}}
        onClick={() => setShowModal(false)}
      >
        <CSSTransition
          in={showModal}
          nodeRef={modalContentRef}
          timeout={300}
          classNames="someThing"
          unmountOnExit
        >
          <div
            ref={modalContentRef}
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: "#878484" }}>
              Вы действительно хотите выйти ?
            </h2>
            <div>
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate("/rooms");
                }}
              >
                Продолжить
              </button>
              <button onClick={() => setShowModal(false)}>Закрыть</button>
            </div>
          </div>
        </CSSTransition>
      </div>
    </>
  );
};

export default Modal;
