import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

const Camera = ({ onExtractedText }) => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const captureImage = () => {
    const capturedImage = webcamRef.current.getScreenshot();
    setImage(capturedImage);
  };

  const extractText = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const { data } = await Tesseract.recognize(image, "eng", {
        logger: (info) => console.log(info), // Logs progress
      });
      onExtractedText(data.text); // Pass extracted text to parent
    } catch (error) {
      console.error("Error during text extraction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!image ? (
        <div>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={400}
          />
          <button onClick={captureImage}>Capture Image</button>
        </div>
      ) : (
        <div>
          <img src={image} alt="Captured" style={{ maxWidth: "100%" }} />
          <button onClick={() => setImage(null)}>Retake</button>
          <button onClick={extractText} disabled={loading}>
            {loading ? "Extracting..." : "Extract Text"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Camera;
