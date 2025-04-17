import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import CameraPhoto, { isMobile } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";

const Camera = ({ onExtractedText }) => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div>
      {!image ? (
        <div>
          {isMobile() ? (
            <CameraPhoto
              onTakePhoto={(dataUri) => captureImageMobile(dataUri)}
              idealFacingMode="environment" // Use back camera
              isImageMirror={false} // Prevent mirroring
              idealResolution={{ width: 1920, height: 1080 }}
              imageType="image/jpeg"
              imageCompression={0.9}
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
          <button onClick={isMobile() ? null : captureImageDesktop}>
            Capture Image
          </button>
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
