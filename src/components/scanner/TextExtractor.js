import React, { useState } from "react";
import "../css/textExtractor.css"; // Import your CSS file for styling
import API from "../../api/api"; // Adjust the import based on your project structure

const TextExtractor = ({ onExtractedText }) => {
  const [previewUrl, setPreviewUrl] = useState(null); // For image preview
  const [base64Image, setBase64Image] = useState(null); // For backend use
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to convert a blob to a Base64 string
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file)); // Display the image preview
      const base64 = await convertBlobToBase64(file); // Convert to Base64
      setBase64Image(base64); // Store the Base64 string for backend use
    }
  };

  const handleTextExtraction = async () => {
    if (!base64Image) return;
    setLoading(true);
    try {
      const response = await API.post("/openai/extract-nutrition", {
        image: base64Image,
      });
      const data = response.data;

      setExtractedText(JSON.stringify(data, null, 2));
      onExtractedText(data); // Send structured data instead of text
    } catch (error) {
      console.error("OpenAI nutrition extraction error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-extractor-container">
      <h2>Upload Product Image</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {previewUrl && (
        <img
          src={previewUrl} // Use the preview URL for displaying the image
          alt="Uploaded"
          style={{ maxWidth: "100%" }}
        />
      )}
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
