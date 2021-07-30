const socket = io('/')
const videoGrid = document.getElementById('video-grid');

var myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});

const myVideo = document.createElement('video'); //CREAMOS EL ELEMENTO HTML DE VIDEO
myVideo.muted = true;

let myVideoStream; //VARIABLE PARA LLAMAR A MI STREAM


//PEDIMOS PERMISO AL USUARIO PARA USAR LA CAMARA
navigator.mediaDevices.getUserMedia({
    video: true,
    audio:true
}).then(stream =>{
    myVideoStream = stream;
    addVideoStream(myVideo, stream)

    myPeer.on('call', (call) => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
        console.log("funciona")
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream)
    })
    
    
    let input = document.getElementById('chat_message')

    input.addEventListener('keyup', (e) => {
        if (e.keyCode == 13 && input.value != ""){
        socket.emit('message', input.value);
        input.value = "";
        }
    })

    socket.on('createMessage', (message) => {
        let messages = document.getElementById('messages');
        let li = document.createElement('li');
        let b = document.createElement('b')
        let br = document.createElement('br');
        b.innerHTML = "User"
        li.append(b)
        li.append(br)
        li.append(message)
        messages.append(li);
        scrollBottom();
    })

})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

const connectToNewUser = (userId, stream) => {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
        console.log("funciona desde conect to new user call on")
    })
}   

//AQUI HACEMOS QUE EL VIDEO SE CARGUE A LA PAGINA
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video)
}

const scrollBottom = () => {
    var d = $('.main_chat_window');
    d.scrollTop(d.prop("scrollHeight"))
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setUnmuteButton = () => {
    let unmuteButton = `<i class="unmute fas fa-microphone-slash"></i>
                          <span>Unmute</span>`;
    let button = document.querySelector('.main_mute_button');
    button.innerHTML = unmuteButton;
}

const setMuteButton = () => {
    let unmuteButton = `<i class="fas fa-microphone"></i>
                          <span>Mute</span>`;
    let button = document.querySelector('.main_mute_button');
    button.innerHTML = unmuteButton;
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setPlayVideo = () => {
    let videoButton = `<i class="stop_video fas fa-video-slash"></i>
                          <span>Start Video</span>`;
    let button = document.querySelector('.main_video_button');
    button.innerHTML = videoButton;
}

const setStopVideo = () => {
    let videoButton = `<i class="fas fa-video"></i>
                          <span>Stop Video</span>`;
    let button = document.querySelector('.main_video_button');
    button.innerHTML = videoButton;
}