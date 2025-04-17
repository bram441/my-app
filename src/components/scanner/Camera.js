import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import { Camera } from "react-camera-pro";

// Custom function to detect if the user is on a mobile device
const isMobileDevice = () => {
  return /Mobi|Android/i.test(navigator.userAgent);
};

const CameraComponent = ({ onExtractedText, onClose }) => {
  const webcamRef = useRef(null);
  const cameraRef = useRef(null); // Ref for react-camera-pro
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const captureImageDesktop = () => {
    const capturedImage = webcamRef.current.getScreenshot();
    setImage(capturedImage);
  };

  const captureImageMobile = () => {
    const capturedImage = cameraRef.current.takePhoto();
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

  const handleClose = () => {
    setImage(null); // Reset the captured image
    setLoading(false); // Reset the loading state
    onClose(); // Call the parent onClose function
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "black",
        zIndex: 1000,
      }}
    >
      {!image ? (
        <div>
          {isMobileDevice() ? (
            <Camera
              ref={cameraRef}
              facingMode="environment" // Use back camera
              aspectRatio="cover" // Ensure the preview fills the screen
              numberOfCamerasCallback={(num) =>
                console.log(`Number of cameras: ${num}`)
              }
            />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={400}
              videoConstraints={{
                facingMode: "environment", // Use back camera
              }}
            />
          )}
          <button
            onClick={
              isMobileDevice() ? captureImageMobile : captureImageDesktop
            }
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Capture Image
          </button>
        </div>
      ) : (
        <div>
          <img
            src={image}
            alt="Captured"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
          <button onClick={() => setImage(null)}>Retake</button>
          <button onClick={extractText} disabled={loading}>
            {loading ? "Extracting..." : "Extract Text"}
          </button>
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
