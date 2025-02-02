import { useEffect, useState } from "react"
import io, { Socket } from 'socket.io-client'

export default function Receiver() {
    const [socket, setSocket] = useState<Socket | null>(null)

    useEffect(() => {
        const socket = io('http://localhost:3000')
        setSocket(socket)
        socket.on('connect', () => {
            socket.emit('connection-type', 'reciever')
            console.log('Reciever connected')
        })

        handleOffer()

        return () => {
            socket.off('connect')
            socket.off('connection-type')
        }

    }, [])

    async function handleOffer() {
        const pc = new RTCPeerConnection()
        socket?.on('offer', async (offer: RTCSessionDescriptionInit) => {
            console.log('Offer received', offer)
            pc.setRemoteDescription(offer)
            const answer = await pc.createAnswer(offer)
            await pc.setLocalDescription(answer)


            socket?.emit('answer', answer)
        })

        pc.ontrack = (event) => {
            const video = document.getElementById('video') as HTMLVideoElement
            if (video) {
                video.srcObject = event.streams[0]
                video.play()
            }
        }
    }


    return (
        <div>


            <h1>Receiver</h1>
            <video id="video" autoPlay playsInline muted></video>
        </div>

    )
}