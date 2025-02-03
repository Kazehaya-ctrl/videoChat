import { useEffect, useState } from "react"
import io, { Socket } from 'socket.io-client'


export default function Sender() {

    const [socket, setSocket] = useState<Socket | null>(null)
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)

    useEffect(() => {
        const socket = io('http://localhost:3000')
        setSocket(socket)
        socket.on('connect', () => {
            socket.emit('connection-type', 'sender')
            console.log('Sender connected')
        })

        return () => {
            peerConnection?.close()
        }
    }, [])

    const handleConnection = async () => {
        if (!socket) {
            alert('Socket not connected')
            return
        }

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        })
        setPeerConnection(pc)

        pc.oniceconnectionstatechange = () => {
            console.log('ICE Connection State:', pc.iceConnectionState)
        }

        pc.onconnectionstatechange = () => {
            console.log('Connection State:', pc.connectionState)
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Sender ICE candidate:", event.candidate);
                socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    type: 'sender'
                });
            } else {
                console.log("Sender ICE candidate gathering completed");
            }
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })

        pc.addTrack(stream.getTracks()[0], stream)

        const video = document.getElementById('video') as HTMLVideoElement
        if (video) {
            video.srcObject = stream
            video.play()
        }

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit('offer', offer)

        socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
            if (!pc.currentRemoteDescription) {
                await pc.setRemoteDescription(answer)
            }
        })

        socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit, type: string }) => {
            if (data.type === 'receiver') {
                try {
                    console.log("Sender received ICE candidate:", data.candidate);
                    await pc.addIceCandidate(data.candidate);
                } catch (e) {
                    console.error('Error adding received ICE candidate', e);
                }
            }
        })
    }



    return (
        <div>

            <h1>Sender</h1>
            <button onClick={handleConnection}>Send Data</button>
            <video id="video" autoPlay playsInline muted></video>
        </div>


    )

}
