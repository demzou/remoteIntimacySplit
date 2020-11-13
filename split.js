
const accessToken = 'ya29.A0AfH6SMAsdnhkLLBqvP4PkghaWbalPtxV3R968hHUwAMZHVgUZY41IKdEF7jA5VdYdFmwLsT6NjvEw8VC-BNLJ-8syYaus5XZBUz6VynfqiOHCRS6_mPTiHyOXwaJvfpRGd_cP-wXa_m6jwPK9x_iPM-eERdPHh-nYk_HzOTpHiU';

let preview = document.getElementById("preview");
let recording = document.getElementById("recording");
let pageTitle = document.getElementById("title");
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");
let downloadButton = document.getElementById("downloadButton");
let uploadButton = document.getElementById("uploadButton");
let logElement = document.getElementById("log");
let overlay = document.getElementById("silhouette");

let tab1 = document.getElementById("part1");
let tab2 = document.getElementById("part2");
let tab3 = document.getElementById("part3");

let file = 0;
let mode = 1;
let request;
let startTime = Date.now();

let recordingTimeMS = 45000;
let folderIdTarget = '1ATJ8lvOvZDFAuDw8Anc1V3rF9PTStEZz';       // Consent folder

// ----- Hide elements when page loads
recording.style.display = 'none';
uploadButton.style.display = 'none';
stopButton.style.display = 'none';
tab1.style.borderColor = '#73FF8C';
tab1.style.color = '#73FF8C';


// ----- Reset containers when changing tab
const reset = () => {
    recording.style.display = 'none';
    uploadButton.style = '';
    uploadButton.style.display = 'none';
    uploadButton.innerHTML = 'Upload';
    preview.style.display = '';
    startButton.style = '';
    startButton.innerHTML = 'Start recording';
    overlay.style.display = '';
    title.innerHTML = 'Preview';
}


// ------ Create JSON file and create downloadable blob, then upload to drive
const saveUserData = (function () {
    let a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    return function(data, fileName) {
        let json = JSON.stringify(data),
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        // a.href = url;
        // a.download = fileName;
        //a.click();

        file = blob;
        window.URL.revokeObjectURL(url);
    };
}());

// Upload function
function uploadData(obj) {
    if (file.name != "") {
      let fr = new FileReader();
      fr.fileName = jsonName;
      fr.fileSize = file.size;
      fr.fileType = file.type;
      fr.readAsArrayBuffer(file);
      fr.onload = resumableUpload;
    }
  }

// ------ User data and consent (JSON)
let userData = {
    firstName: 'Clem',
    lastName: 'Debaig',
    date: new Date(),
    consent: true
}, 
jsonName = userData.firstName + '-consent-form.json';

saveUserData(userData, jsonName);
uploadData();



// ----- Navigation
tab1.onclick = () => {
    tab1.style.borderColor = '#73FF8C';
    tab1.style.color = '#73FF8C';

    tab2.style.borderColor = 'black';
    tab2.style.color = 'white';
    tab3.style.borderColor = 'black';
    tab3.style.color = 'white';

    overlay.src='assets/overlay-part1-a.svg';
    mode =1;
    recordingTimeMS = 45000;
    folderIdTarget = '1uWflZozLy1a9iCxO9rFeiLbkOsi5UbJs';   // Target folder for part 1
    reset();
};
tab2.onclick = () => {
    tab2.style.borderColor = '#73FF8C';
    tab2.style.color = '#73FF8C';

    tab1.style.borderColor = 'black';
    tab1.style.color = 'white';
    tab3.style.borderColor = 'black';
    tab3.style.color = 'white';

    overlay.src='assets/overlay-part2-a.svg';
    mode=2;
    recordingTimeMS = 59000;
    folderIdTarget = '1LgfIUuVH9SV4v6-5qbewFvRAiOzaiwSs';   // Target folder for part 2
    reset();
};
tab3.onclick = () => {
    tab3.style.borderColor = '#73FF8C';
    tab3.style.color = '#73FF8C';

    tab2.style.borderColor = 'black';
    tab2.style.color = 'white';
    tab1.style.borderColor = 'black';
    tab1.style.color = 'white';

    overlay.src='assets/overlay-part3.svg';
    mode=3;
    recordingTimeMS = 30000;
    folderIdTarget = '1PYkiYv-Cy83ls3hnQN9KadSDEA0ntP6p';     // Target folder for part 3
    reset();
};



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

// Log recording status
function log(msg) {
  logElement.innerHTML += msg + "\n";
}

// Delay (recording duration)
function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}

//- Recording function
function startRecording(stream, lengthInMS) {

    startTime = Date.now();

    // Update info on page
    startButton.innerHTML = "Recording...";
    startButton.style.backgroundColor = "red";
    startButton.style.color = "white";
    pageTitle.innerHTML = "Recording";

    overlayAnimation();

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

// ---- Start + Recording + download
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
    overlay.style.display = 'none';
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
//////-- Moved to the top
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
        folderId: folderIdTarget
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
        uploadButton.innerHTML = msg;
        uploadButton.style.backgroundColor = 'black';
        uploadButton.style.color = 'white';
        uploadButton.style.pointerEvents = 'none';
        if(msg == "Done") {
            uploadButton.style.color = '#73FF8C';
        }
    });
}


// ---- Overlay Animation for each mode
const overlayAnimation = () => {
    request = requestAnimationFrame(overlayAnimation);
    let timeEllapsed = Date.now()-startTime;

    if(mode ==1) {
        // Animation for part 1
        if(timeEllapsed >= 4000 && timeEllapsed < 7000) {
            overlay.src='assets/overlay-part1-b.svg';
        }
        if(timeEllapsed >= 7000 && timeEllapsed < 12000) {
            overlay.src='assets/overlay-part1-c.svg';
        }
        if(timeEllapsed >= 12000 && timeEllapsed < 14000) {
            overlay.src='assets/overlay-part1-d.svg';
        }
        if(timeEllapsed >= 14000 && timeEllapsed < 15000) {
            overlay.src='assets/overlay-part1-e.svg';
        }
        if(timeEllapsed >= 15000 && timeEllapsed < 17000) {
            overlay.src='assets/overlay-part1-f.svg';
        }
        if(timeEllapsed >= 17000 && timeEllapsed < 21000) {
            overlay.src='assets/overlay-part1-g.svg';
        }
        if(timeEllapsed >= 21000 && timeEllapsed < 23000) {
            overlay.src='assets/overlay-part1-h.svg';
        }
        if(timeEllapsed >= 23000 && timeEllapsed < 28000) {
            overlay.src='assets/overlay-part1-i.svg';
        }
        if(timeEllapsed >= 28000 && timeEllapsed < 31000) {
            overlay.src='assets/overlay-part1-j.svg';
        }
        if(timeEllapsed >= 31000 && timeEllapsed < 33000) {
            overlay.src='assets/overlay-part1-k.svg';
        }
        if(timeEllapsed >= 33000 && timeEllapsed < 38000) {
            overlay.src='assets/overlay-part1-l.svg';
        }
        if(timeEllapsed >= 38000 && timeEllapsed < recordingTimeMS) {
            overlay.src='assets/overlay-part1-m.svg';
        }

        if(timeEllapsed >= recordingTimeMS) {
            //overlay.src='assets/face-part1.svg';
            cancelAnimationFrame(request)
        }
    }

    if(mode ==2) {
        // Animation for part 2
        if(timeEllapsed >= 5000 && timeEllapsed < 8000) {
            overlay.src='assets/overlay-part2-b.svg';
        }
        if(timeEllapsed >= 8000 && timeEllapsed < 10000) {
            overlay.src='assets/overlay-part2-c.svg';
        }
        if(timeEllapsed >= 10000 && timeEllapsed < 12000) {
            overlay.src='assets/overlay-part2-d.svg';
        }
        if(timeEllapsed >= 12000 && timeEllapsed < 13000) {
            overlay.src='assets/overlay-part2-e.svg';
        }
        if(timeEllapsed >= 13000 && timeEllapsed < 14000) {
            overlay.src='assets/overlay-part2-f.svg';
        }
        if(timeEllapsed >= 14000 && timeEllapsed < 15000) {
            overlay.src='assets/overlay-part2-g.svg';
        }
        if(timeEllapsed >= 15000 && timeEllapsed < 16000) {
            overlay.src='assets/overlay-part2-h.svg';
        }
        if(timeEllapsed >= 16000 && timeEllapsed < 17000) {
            overlay.src='assets/overlay-part2-hh.svg';
        }
        if(timeEllapsed >= 17000 && timeEllapsed < 20000) {
            overlay.src='assets/overlay-part2-hhh.svg';
        }
        if(timeEllapsed >= 20000 && timeEllapsed < 22000) {
            overlay.src='assets/overlay-part2-i.svg';
        }
        if(timeEllapsed >= 22000 && timeEllapsed < 23000) {
            overlay.src='assets/overlay-part2-j.svg';
        }
        if(timeEllapsed >= 23000 && timeEllapsed < 25000) {
            overlay.src='assets/overlay-part2-k.svg';
        }
        if(timeEllapsed >= 25000 && timeEllapsed < 31000) {
            overlay.src='assets/overlay-part2-kk.svg';
        }
        if(timeEllapsed >= 31000 && timeEllapsed < 38000) {
            overlay.src='assets/overlay-part2-l.svg';
        }
        if(timeEllapsed >= 38000 && timeEllapsed < 39000) {
            overlay.src='assets/overlay-part2-m.svg';
        }
        if(timeEllapsed >= 39000 && timeEllapsed < 40000) {
            overlay.src='assets/overlay-part2-n.svg';
        }
        if(timeEllapsed >= 40000 && timeEllapsed < 42000) {
            overlay.src='assets/overlay-part2-o.svg';
        }
        if(timeEllapsed >= 42000 && timeEllapsed < 44000) {
            overlay.src='assets/overlay-part2-p.svg';
        }
        if(timeEllapsed >= 44000 && timeEllapsed < 46000) {
            overlay.src='assets/overlay-part2-q.svg';
        }
        if(timeEllapsed >= 46000 && timeEllapsed < 49000) {
            overlay.src='assets/overlay-part2-r.svg';
        }
        if(timeEllapsed >= 49000 && timeEllapsed < 52000) {
            overlay.src='assets/overlay-part2-s.svg';
        }
        if(timeEllapsed >= 52000 && timeEllapsed < recordingTimeMS) {
            overlay.src='assets/overlay-part2-t.svg';
        }

        if(timeEllapsed >= recordingTimeMS) {
            //overlay.src='assets/face-part1.svg';
            cancelAnimationFrame(request)
        }
    }

    if(mode ==3) {
        // No animation for part 3
        cancelAnimationFrame(request);
    }
}