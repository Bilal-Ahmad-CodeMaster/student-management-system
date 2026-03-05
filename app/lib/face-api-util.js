import * as faceapi from "face-api.js";

export const loadModels = async () => {
  const MODEL_URL = "/models";
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    console.log("Face Models Ready");
  } catch (error) {
    console.error("AI Model Error:", error);
  }
};

// Internal helper for resizing
const optimizeImage = (img) => {
  const canvas = document.createElement("canvas");
  const maxWidth = 600;
  let width = img.width;
  let height = img.height;

  if (width > maxWidth) {
    height = (maxWidth / width) * height;
    width = maxWidth;
  }
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(img, 0, 0, width, height);
  return canvas;
};

export const getLabeledFaceDescriptions = async (students, setStatus) => {
  const descriptions = [];

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    if (setStatus)
      setStatus(`AI Processing ${i + 1}/${students.length}: ${student.name}`);

    try {
      const rewriteUrl = student.picture
        ? student.picture.replace(
            "https://ebackend.s3.eu-north-1.amazonaws.com",
            "/s3-images",
          )
        : `https://ui-avatars.com/api/?name=${student.name}`;

      const img = await faceapi.fetchImage(rewriteUrl);
      const optimizedCanvas = optimizeImage(img);

      const detections = await faceapi
        .detectSingleFace(optimizedCanvas)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        descriptions.push(
          new faceapi.LabeledFaceDescriptors(student._id, [
            detections.descriptor,
          ]),
        );
      } else {
        console.warn(`No face found for ${student.name}`);
      }
    } catch (err) {
      console.error(`Error with ${student.name}:`, err.message);
    }
  }
  return descriptions;
};
