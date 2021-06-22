const ytdl = require('ytdl-core')
const fs = require('fs')
const path = require('path')
const { dialog } = require('electron').remote

const download = document.getElementById('DOWNLOAD')
const video = document.getElementById('URL')
const selection = document.getElementById('FORMAT')
const folder = document.getElementById('FOLDER')

const pNAME = document.getElementById('VIDEO_NAME')
const pLENGTH = document.getElementById('VIDEO_LENGTH')
const pCREATOR = document.getElementById('VIDEO_CREATOR')
const pDATE = document.getElementById('VIDEO_PUBLISHED')
const pFSIZE = document.getElementById('FILE_SIZE')

const progbar = document.getElementById('PROG_BAR_IN')

let folderSelected = null

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function CheckYTUrl(url) {
    var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if(url.match(p)){
        return true;
    }
    return false;
}

async function updateInfo() {
    const vinfo = await ytdl.getInfo(video.value)
    const video_title = vinfo.videoDetails.title
    const length = new Date(vinfo.videoDetails.lengthSeconds * 1000).toISOString().substr(11, 8)
    const author = vinfo.videoDetails.author.name
    const date = vinfo.videoDetails.uploadDate

    pNAME.innerText = `Video Title: ${video_title}`
    pLENGTH.innerText = `Video Length: ${length}`
    pCREATOR.innerText = `Video Publisher: ${author}`
    pDATE.innerText = `Video Created: ${date}`

    if (selection.value == "mp4" || selection.value == "webm" || selection.value == "mov") {
        const size = Math.round((2.65/60)*vinfo.videoDetails.lengthSeconds*100)/100
        pFSIZE.innerText = `Estimated File Size: ${size}MB\n\n(Based on a 1080p (FHD) download. Expect lower/higher sizes)`
    } else if (selection.value == "mp3" || selection.value == "wav" || selection.value == "m4a") {
        const size = Math.round((1.35/60)*vinfo.videoDetails.lengthSeconds*100)/100
        pFSIZE.innerText = `Estimated File Size: ${size}MB\n\n(Based on a 180kbps download. Expect lower/higher sizes)`
    }
}

folder.onclick = async function(e) {
    e.preventDefault()
    let selected = await dialog.showOpenDialog({properties: ['openDirectory']})
    folderSelected = selected.filePaths[0]
    folder.innerHTML = `Save To: ${folderSelected==null&&'None Selected'||folderSelected}`
}

async function runProgressBar() {
    for (var i = 0; i<100; i++) {
        await wait(10).then(() => {
            progbar.style.width = `${i}%`
            progbar.style.opacity = `${1-i/100}`
        })
    }
}

download.onclick = async function(e) {
    e.preventDefault()
    if (CheckYTUrl(video.value)) {
        progbar.style.width = "0%"
        progbar.style.opacity = "1"
        runProgressBar()

        const vinfo = await ytdl.getInfo(video.value)
        const video_title = vinfo.videoDetails.title

        const pathName = path.join(folderSelected, video_title)
        if (selection.value == "mp3" || selection.value == "wav" || selection.value == "m4a") {
            ytdl(video.value, {filter: 'audioonly'}).pipe(fs.createWriteStream(`${pathName}.${selection.value}`))
        } else if (selection.value == "mp4" || selection.value == "webm" || selection.value == "mov") {
            ytdl(video.value).pipe(fs.createWriteStream(`${pathName}.${selection.value}`))
        }
    }
}