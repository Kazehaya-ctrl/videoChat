import { useEffect, useState } from "react"
import io, { Socket } from 'socket.io-client'


export default function Sender() {

    const [socket, setSocket] = useState<Socket | null>(null)
    useEffect(() => {
        const socket = io('http://localhost:3000')
        setSocket(socket)
        socket.on('connect', () => {
            socket.emit('connection-type', 'sender')
            console.log('Sender connected')
        })

        return () => {
            socket.off('connect')
            socket.off('connection-type')
        }
    }, [])

    const handleConnection = async () => {
        if (!socket) {
            alert('Socket not connected')
            return
        }

        const pc = new RTCPeerConnection()
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit('offer', offer)

        socket.on('answer', (answer: RTCSessionDescriptionInit) => {
            pc.setRemoteDescription(answer)
        })

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })

        const video = document.getElementById('video') as HTMLVideoElement
        if (video) {
            video.srcObject = stream
            video.play()
        }
        pc.addTrack(stream.getTracks()[0], stream)

    }



    return (
        <div>

            <h1>Sender</h1>
            <button onClick={handleConnection}>Send Data</button>
            <video id="video" autoPlay playsInline muted></video>
        </div>


    )

}
