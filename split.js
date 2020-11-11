let preview = document.getElementById("preview");
let recording = document.getElementById("recording");
let pageTitle = document.getElementById("title");
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");
let downloadButton = document.getElementById("downloadButton");
let uploadButton = document.getElementById("uploadButton");
let logElement = document.getElementById("log");
let file = 0;


// ----- Hide elements when page loads (step2)
recording.style.display = 'none';
uploadButton.style.display = 'none';
stopButton.style.display = 'none';

// ---- Show preview when land on page
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  }).then(stream => {
    preview.srcObject = stream;
    //downloadButton.href = stream;
    preview.captureStream = preview.captureStream || preview.mozCaptureStream;
    return new Promise(resolve => preview.onplaying = resolve);
  })


// ----- Recording

let recordingTimeMS = 2000;

// Log recording status
function log(msg) {
  logElement.innerHTML += msg + "\n";
}

// Delay (recording duration)
function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}

// Recording function
function startRecording(stream, lengthInMS) {

    // Update info on page
    startButton.innerHTML = "Recording...";
    startButton.style.backgroundColor = "red";
    startButton.style.color = "white";
    pageTitle.innerHTML = "Recording";

  let recorder = new MediaRecorder(stream);
  let data = [];
 
  recorder.ondataavailable = event => data.push(event.data);
  recorder.start();
  log(recorder.state + " for " + (lengthInMS/1000) + " seconds...");
 
  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  });

  let recorded = wait(lengthInMS).then(
    () => recorder.state == "recording" && recorder.stop()
  );
 
  return Promise.all([
    stopped,
    recorded
  ])
  .then(() => data);
}

// Stop function -> Turn webcam off
function stop(stream) {
  stream.getTracks().forEach(track => track.stop());
}

// Start + Recording + download
startButton.addEventListener("click", function() {
//   navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: false
  //})
  //.then(stream => {
//     preview.srcObject = stream;
    //downloadButton.href = stream;
    // preview.captureStream = preview.captureStream || preview.mozCaptureStream;
    // return new Promise(resolve => preview.onplaying = resolve);
  //}).then(
      //() => 
      startRecording(preview.captureStream(), recordingTimeMS)
      //)
  .then (recordedChunks => {

    //Update elements on page
    preview.style.display = 'none';
    startButton.style.display = 'none';
    recording.style.display='';
    uploadButton.style.display = '';
    pageTitle.innerHTML = "Replay & Upload";
    //downloadButton.style.display='';
    let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
    file = recordedBlob;
    recording.src = URL.createObjectURL(recordedBlob);
    //downloadButton.href = recording.src;
    //downloadButton.download = "RecordedVideo.webm";             // Match file name with the one below (create global variable)
    
    log("Successfully recorded " + recordedBlob.size + " bytes of " +
        recordedBlob.type + " media.");
  })
  .catch(log);
}, false);

// Stop button
stopButton.addEventListener("click", function() {
  stop(preview.srcObject);
}, false);


// ---- Upload

// GDrive API Access token
//const accessToken = gapi.auth.getToken().access_token; // Please set access token here.
const accessToken = 'ya29.A0AfH6SMB-KHpcxI-TbseV2s-AlASOvSuJHECPNwVCUtC_P76hzcZKUqaaQbEdPgyZHjGPCTl0-A2kU_NqVexhtpVaYs-Sj-waXr4GICWFLwAPI0hSZpan6FUQddCSD-SO1dhPeVlurILJ_Y0eLiW69UfF0VQS209gWrLI44AXXE4';
//https://developers.google.com/oauthplayground//
// Will need to create proper authentification

// Upload button
uploadButton.addEventListener('click', run, false);

// File selection and upload
function run(obj) {
    //const file = obj.target.files[0];
    //const file = recordedBlob;
    if (file.name != "") {
      let fr = new FileReader();
      //fr.fileName = file.name;
      fr.fileName = 'video.webm';       // /!\ update file name with some metadate
      fr.fileSize = file.size;
      fr.fileType = file.type;
      fr.readAsArrayBuffer(file);
      fr.onload = resumableUpload;
    }
  }

//library
function resumableUpload(e) {
    document.getElementById("progress").innerHTML = "Initializing.";
    const f = e.target;
    const resource = {
        fileName: f.fileName,
        fileSize: f.fileSize,
        fileType: f.fileType,
        fileBuffer: f.result,
        accessToken: accessToken,
        folderId: '1UBJ-nCLMRzh16SdjQCXzAPODaTxQZNWl'
    };
    const ru = new ResumableUploadToGoogleDrive();
    ru.Do(resource, function(res, err) {
        if (err) {
        console.log(err);
        return;
        }
        console.log(res);
        let msg = "";
        if (res.status == "Uploading") {
        msg =
            Math.round(
            (res.progressNumber.current / res.progressNumber.end) * 100
            ) + "%";
        } else {
        msg = res.status;
        }
        document.getElementById("progress").innerText = msg;
    });
}
