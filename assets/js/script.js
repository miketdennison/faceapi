const video = document.getElementById("video");

// Run all calls in parallel to make it quicker
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("../../models"), // smaller face detector to run faster
    faceapi.nets.faceLandmark68Net.loadFromUri("../../models"), // recognize facial features
    faceapi.nets.faceRecognitionNet.loadFromUri("../../models"), // allow api to recognixe where face is
    faceapi.nets.faceExpressionNet.loadFromUri("../../models"), // recognize expressions
]).then(startVideo);

function startVideo() {
    navigator.getUserMedia({
            video: {} // want to get video
        },
        stream => video.srcObject = stream, // whats coming from web cam is the src of our video
        err => console.error(err)); // if it doesn't work
}

video.addEventListener("play", () => {
    // Make async request every 100 mili seconds to re-evaluate face data
    const canvas = faceapi.createCanvasFromMedia(video); // createa canvas for video to overlay face elements 
    document.body.append(canvas); // append the canvas to the document (position doesnt matter)
    const displaySize = {
        width: video.width,
        height: video.height
    }
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        const resizedDetections = faceapi.resizeResults(detections, displaySize); // properly sized elements for canvas
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections); // draw detections on video
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }, 100);

});