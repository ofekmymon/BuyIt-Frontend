import React, { useState } from "react";
import styles from "./SellProducts.module.css";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { TiDelete } from "react-icons/ti";
import axios from "axios";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function SellProducts() {
  const [error, setError] = useState("");
  // images for display
  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("electronics");
  const [currentTag, setCurrentTag] = useState("");
  const [tags, setTags] = useState([]);
  const [details, setDetails] = useState("");
  const [price, setPrice] = useState(0);

  const useQuery = useQueryClient();
  const user = useQuery.getQueryData(["user"]);

  const generateKey = () => {
    return `${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const displayTags = () => {
    // renders the tags based on the state of them
    return tags.map((tag) => {
      return (
        <div key={tag.id} className={styles.tagContainer}>
          <p className={styles.tag}>{tag.tag}</p>
          <TiDelete
            onClick={() => {
              deleteTag(tag.id);
            }}
            className={styles.tagDelete}
          />
        </div>
      );
    });
  };
  const displayImages = () => {
    // renders the images based on the state of them
    return images.map((image) => {
      return (
        <div key={image.id} id={image.id} className={styles.imageWrap}>
          <img
            src={image.img}
            alt={`Uploaded ${image.id}`}
            className={styles.image}
          />
          <TiDelete
            onClick={() => deleteImage(image.id)}
            className={styles.imageDelete}
          />
        </div>
      );
    });
  };

  const deleteTag = (id) => {
    setTags(tags.filter((t) => t.id !== id));
  };

  const deleteImage = (id) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const validateInfo = () => {
    // validate the form data before sending
    if (name.length < 2 || name.length > 100) {
      setError("*Name up to 100 letters and at least 2*");
      return false;
    }
    if (images.length < 1) {
      setError("*1 Image at least is a must*");
      return false;
    }
    if (tags.length < 1) {
      setError("*1 Tag at least is a must*");
      return false;
    }
    if (details.length < 10 || details.length > 1000) {
      setError("*Details must have at least 10 characters and up to 1000*");
      return false;
    }
    if (price <= 0 || price > 99999) {
      setError("*Price must be at least 0.1 dollar and up to 99999*");
      return false;
    }
    return true;
  };

  const uploadProduct = async () => {
    // handels upload of product to db
    console.log(mutateProducts.isLoading);
    const formData = new FormData();
    formData.append("seller", user.name);
    formData.append("name", name);
    formData.append("category", category);
    formData.append("details", details);
    formData.append("price", price);
    const tagValues = tags.map((tag) => tag.tag);
    formData.append("tags", JSON.stringify(tagValues));
    images.forEach((image) => {
      formData.append("images", image.file);
    });

    const response = await axios.post(
      `${SERVER_URL}/products/upload-product`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  };

  const mutateProducts = useMutation({
    mutationFn: uploadProduct,
    onSuccess: (data) => {
      if (data.status === "success") {
        setError("");
        alert("*Product uploaded successfully!*");
        window.location.reload();
      } else {
        setError("*Error uploading product.*");
      }
    },
    onError: (error) => {
      setError(`*Error uploading product: ${error.message}*`);
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}> Sell Your Products Here!</div>
      {/* Error */}
      <div style={{ color: "red", textAlign: "center" }}>{error}</div>
      {/* Image */}
      <div className={styles.imageContainer}>
        <div className={styles.imageInsertion}>
          <label className={styles.imageLabel} htmlFor="Image">
            Choose A Picture (up to 5)
          </label>
          <input
            id="Image"
            className={styles.imageInput}
            disabled={images.length >= 5}
            type="file"
            accept="image/png, image/jpeg"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImages((prevImages) => [
                    ...prevImages,
                    { file, img: reader.result, id: generateKey() },
                  ]);
                };
                reader.readAsDataURL(file);
              }
              e.target.value = null; // This ensures the input triggers onChange again
            }}
          />
        </div>
        <div className={styles.imagesDisplayed}>{displayImages()}</div>
      </div>
      {/* Name */}
      <div className={styles.productName}>
        <label htmlFor="name">Enter Product Name:</label>
        <input
          id="name"
          className={styles.nameInput}
          onChange={(e) => {
            setName(e.target.value);
          }}
          type="text"
        />
      </div>
      {/* Category */}
      <div className={styles.categoryContainer}>
        <label htmlFor="categories">Category:</label>
        <select
          id="categories"
          className={styles.categories}
          onChange={(e) => {
            setCategory(e.target.value);
          }}
        >
          <option value="electronics">Electronics</option>
          <option value="men-clothing">Men's Clothing</option>
          <option value="women-clothing">Women's Clothing</option>
          <option value="books">Books</option>
          <option value="art">Art</option>
          <option value="video-games">Video Games</option>
          <option value="sport-and-hiking">Sports and Hiking</option>
          <option value="home-decoration">Home Decoration</option>
          <option value="hobbies">Hobbies</option>
        </select>
      </div>
      {/* Tags */}
      <div className={styles.tagsContainer}>
        <div>
          <label htmlFor="tagInput">Tags (for search queries): </label>
          <input
            id="tagInput"
            className={styles.tagInput}
            placeholder="Enter Tag Here"
            disabled={tags.length >= 5}
            maxLength={20}
            onChange={(e) => {
              setCurrentTag(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && currentTag.length > 0) {
                e.preventDefault();
                setTags([{ tag: currentTag, id: generateKey() }, ...tags]);
                e.target.value = "";
                setCurrentTag("");
              }
            }}
          ></input>
          <button
            className={styles.enterBtn}
            disabled={tags.length >= 5}
            onClick={() => {
              if (currentTag.length > 0) {
                setTags([{ tag: currentTag, id: generateKey() }, ...tags]);
                document.getElementById("tagInput").value = "";
                setCurrentTag("");
              }
            }}
          >
            Enter
          </button>
        </div>
        <div className={styles.tagsDisplayed}>{displayTags()}</div>
      </div>
      {/* Details */}
      <div className={styles.detailsContainer}>
        <label>Product Details:</label>
        <textarea
          id="detailsInput"
          className={styles.detailsInput}
          onChange={(e) => {
            setDetails(e.target.value);
          }}
        />
      </div>
      {/* Price */}
      <div className={styles.price}>
        <label htmlFor="priceInput">Price:</label>
        <input
          id="priceInput"
          type="number"
          max={99999}
          min={0.1}
          onChange={(e) => {
            setPrice(e.target.value);
          }}
        />
        $
      </div>
      <button
        disabled={mutateProducts.isPending}
        onClick={async () => {
          if (validateInfo()) {
            mutateProducts.mutate();
          }
        }}
        className={styles.btn}
      >
        {mutateProducts.isPending ? "Loading..." : "Sell It!"}
      </button>
    </div>
  );
}
