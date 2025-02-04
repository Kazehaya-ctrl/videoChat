import { useEffect, useState, useRef } from "react"
import io, { Socket } from 'socket.io-client'

export default function Sender() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [socket, setSocket] = useState<Socket | null>(null)
    const [pc, setPc] = useState<RTCPeerConnection | null>(null)

    useEffect(() => {
        const connection = io('ws://localhost:3000')
        setSocket(connection)

        connection.on('connect', () => {
            console.log(`Sender connect ${connection.id}`)
            connection.emit('identify-as', 'sender')
        })

        return () => {
            socket?.emit('disconnect')
        }
    }, [])

    const handleSender = async () => {
        const peerConnection = new RTCPeerConnection()
        setPc(peerConnection)

        console.log('peerConnection formed')


        peerConnection.onicecandidate = (event) => {
            socket?.emit('icecandidate', event.candidate)
        }

        socket?.on('answer', async (answer: any) => {
            await peerConnection.setRemoteDescription(answer)
        })

        socket?.on('icecandidate', (candidate: any) => {
            peerConnection.addIceCandidate(candidate)
        })

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })

        if (videoRef.current) {
            videoRef.current.srcObject = stream
        }
        stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream)
        })

        peerConnection.onnegotiationneeded = async () => {
            const offer = await peerConnection.createOffer()
            await peerConnection.setLocalDescription(offer)
            socket?.emit('offer', offer)
        }
    }


    return (<div><h1>Sender</h1><video ref={videoRef} autoPlay playsInline muted></video><button onClick={handleSender}>Send vid3o</button></div>)
}