import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import Loader from "../assets/loader.gif";
import { setAvatarRoute } from "../utils/APIRoutes";

const SetAvatar = () => {
  const api = `https://api.multiavatar.com/45678945`;
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(undefined);
  const navigate = useNavigate();
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const handleSetProfileImage = async () => {
    if (selected === undefined) {
      toast.error("Please select an avatar", toastOptions);
    } else {
      const user = JSON.parse(localStorage.getItem("user"));
      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: avatars[selected],
      });

      if (data.isSet) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            isAvatarImageSet: data.isSet,
            avatarImage: data.image,
          })
        );
        navigate("/");
      } else {
        toast.error("Error setting avatar. Please try again", toastOptions);
      }
    }
  };

  useEffect(() => {
    const fetchAvatars = async () => {
      if (!localStorage.getItem("avatars")) {
        const data = [];
        for (let i = 0; i < 4; i++) {
          const image = await axios.get(
            `${api}/${Math.round(Math.random() * 1000)}`
          );
          data.push(btoa(image.data));
        }

        localStorage.setItem("avatars", JSON.stringify(data));
        setAvatars(data);
      } else {
        setAvatars(JSON.parse(localStorage.getItem("avatars")));
      }
      setIsLoading(false);
    };

    if (!localStorage.getItem("user")) {
      navigate("/login");
    }

    fetchAvatars();
  }, []);

  return (
    <>
      {isLoading ? (
        <img className="loader" src={Loader} alt="" />
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className={`avatar ${selected === index ? "selected" : ""}`}
              >
                <img
                  src={`data:image/svg+xml;base64,${avatar}`}
                  alt="avatar"
                  onClick={() => setSelected(index)}
                />
              </div>
            ))}
          </div>

          <button className="submit-btn" onClick={handleSetProfileImage}>
            Set as Profile Picture
          </button>
        </Container>
      )}
      <ToastContainer />
    </>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;

  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    h1 {
      color: white;
    }
  }

  .avatars {
    display: flex;
    gap: 2rem;

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transtition: 0.5s ease-in-out;

      img {
        height: 6rem;
      }
    }

    .selected {
      border: 0.4rem solid #4e0eff;
    }
  }

  .submit-btn {
    background-color: #997af0;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-width: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    transition: 0.5s ease-in-out;

    &:hover {
      background-color: #4c0eff;
    }
  }
`;

export default SetAvatar;
