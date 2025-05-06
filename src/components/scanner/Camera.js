import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera } from "react-camera-pro";
import API from "../../api/api"; // Import the API instance

// Custom function to detect if the user is on a mobile device
const isMobileDevice = () => {
  return /Mobi|Android/i.test(navigator.userAgent);
};

const CameraComponent = ({ onExtractedText, onClose, switchToUpload }) => {
  const webcamRef = useRef(null);
  const cameraRef = useRef(null); // Ref for react-camera-pro
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get dynamic resolution based on screen size
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const dynamicResolution = {
    width: screenWidth || 1920, // Fallback to 1920 if undefined
    height: screenHeight || 1080, // Fallback to 1080 if undefined
  };

  // Capture image for desktop (Webcam)
  const captureImageDesktop = () => {
    const capturedImage = webcamRef.current.getScreenshot();
    setImage(capturedImage);
  };

  // Capture image for mobile (react-camera-pro)
  const captureImageMobile = () => {
    const capturedImage = cameraRef.current.takePhoto();
    setImage(capturedImage);
  };

  // Preprocess the image (convert to grayscale)
  const preprocessImage = async (imageDataUri) => {
    const img = new Image();
    img.src = imageDataUri;

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Convert to grayscale
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg; // Red
          data[i + 1] = avg; // Green
          data[i + 2] = avg; // Blue
        }
        ctx.putImageData(imageData, 0, 0);

        // Return the processed image as a data URI
        resolve(canvas.toDataURL("image/jpeg"));
      };

      img.onerror = (err) => {
        reject(err);
      };
    });
  };

  // Extract text from the image
  const extractText = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const preprocessedImage = await preprocessImage(image);
      console.log("Preprocessed Image:", preprocessedImage); // Log the preprocessed image

      // Use the API instance to send the request
      const response = await API.post("/openai/extract-nutrition", {
        image: preprocessedImage,
      });

      const data = response.data;
      onExtractedText(data); // Pass extracted text to parent
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
              resolution={dynamicResolution} // Dynamic resolution
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover", // Ensure proper scaling
              }}
            />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={1920} // Full HD width
              videoConstraints={{
                width: dynamicResolution.width,
                height: dynamicResolution.height,
                facingMode: "environment", // Use back camera
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain", // Ensure proper scaling
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
          <button
            onClick={switchToUpload} // Switch back to "Upload Picture"
            style={{
              position: "absolute",
              bottom: "70px",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Go Back to Upload Picture
          </button>
        </div>
      ) : (
        <div>
          <img
            src={image}
            alt="Captured"
            style={{
              maxWidth: "100%",
              maxHeight: "80vh", // Limit the height to ensure space for buttons
              display: "block",
              margin: "0 auto",
            }}
          />
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <button
              onClick={() => setImage(null)}
              style={{ marginRight: "10px" }}
            >
              Retake
            </button>
            <button
              onClick={extractText}
              disabled={loading}
              style={{ marginRight: "10px" }}
            >
              {loading ? "Extracting..." : "Extract Text"}
            </button>
            <button
              onClick={handleClose}
              style={{
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
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
