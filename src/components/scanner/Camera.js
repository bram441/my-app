import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import CameraPhoto from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";

// Custom function to detect if the user is on a mobile device
const isMobileDevice = () => {
  return /Mobi|Android/i.test(navigator.userAgent);
};

const Camera = ({ onExtractedText, onClose }) => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [screenDimensions, setScreenDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Update screen dimensions dynamically
  useEffect(() => {
    const handleResize = () => {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const captureImageDesktop = () => {
    const capturedImage = webcamRef.current.getScreenshot();
    setImage(capturedImage);
  };

  const captureImageMobile = (dataUri) => {
    setImage(dataUri);
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
    <div
      style={{
        width: isMobileDevice() ? screenDimensions.width : "auto",
        height: isMobileDevice() ? screenDimensions.height : "auto",
        position: isMobileDevice() ? "fixed" : "relative",
        top: 0,
        left: 0,
        backgroundColor: isMobileDevice() ? "black" : "transparent",
        zIndex: isMobileDevice() ? 1000 : "auto",
      }}
    >
      {!image ? (
        <div>
          {isMobileDevice() ? (
            <CameraPhoto
              onTakePhoto={(dataUri) => captureImageMobile(dataUri)}
              idealFacingMode="environment" // Use back camera
              isImageMirror={false} // Prevent mirroring
              idealResolution={{
                width: 1920, // Full HD width
                height: 1080, // Full HD height
              }}
              imageType="image/jpeg"
              imageCompression={0.8} // Lower compression for better quality
              onCameraError={(error) => {
                console.error("Camera Error:", error);
                alert("Camera not supported. Please upload an image instead.");
              }}
              style={{
                width: "100%", // Full width
                height: "100%", // Full height
                objectFit: "cover", // Ensure the camera preview covers the screen
              }}
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
            onClick={isMobileDevice() ? null : captureImageDesktop}
            style={{
              position: isMobileDevice() ? "absolute" : "relative",
              bottom: isMobileDevice() ? "20px" : "auto",
              left: isMobileDevice() ? "50%" : "auto",
              transform: isMobileDevice() ? "translateX(-50%)" : "none",
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
              maxWidth: isMobileDevice() ? "100%" : "auto",
              maxHeight: isMobileDevice() ? "100%" : "auto",
            }}
          />
          <button onClick={() => setImage(null)}>Retake</button>
          <button onClick={extractText} disabled={loading}>
            {loading ? "Extracting..." : "Extract Text"}
          </button>
          {isMobileDevice() && (
            <button
              onClick={onClose}
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
          )}
        </div>
      )}
    </div>
  );
};

export default Camera;
