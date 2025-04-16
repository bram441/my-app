import React, { useState } from "react";
import Tesseract from "tesseract.js";
import "../css/textExtractor.css"; // Import your CSS file for styling

const TextExtractor = ({ onExtractedText }) => {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleTextExtraction = () => {
    if (!image) return;

    setLoading(true);
    Tesseract.recognize(image, "eng", {
      logger: (info) => console.log(info), // Logs progress
    })
      .then(({ data: { text } }) => {
        setExtractedText(text);
        onExtractedText(text); // Pass extracted text to parent component
      })
      .catch((error) => {
        console.error("Error during text extraction:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="text-extractor-container">
      <h2>Upload Product Image</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && <img src={image} alt="Uploaded" style={{ maxWidth: "100%" }} />}
      <button onClick={handleTextExtraction} disabled={loading}>
        {loading ? "Extracting..." : "Extract Text"}
      </button>
      {extractedText && (
        <div>
          <h3>Extracted Text:</h3>
          <textarea
            value={extractedText}
            readOnly
            style={{ width: "100%", height: "150px" }}
          />
        </div>
      )}
    </div>
  );
};

export default TextExtractor;
