import { useEffect, useState, useRef } from "react"
import io, { Socket } from "socket.io-client"

export default function Receiver() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [socket, setSocket] = useState<Socket | null>(null)
    const [pc, setPc] = useState<RTCPeerConnection | null>(null)

    useEffect(() => {
        const connection = io(`ws://localhost:3000`)
        setSocket(connection)

        connection.on('connect', () => {
            console.log(`Receiver connect ${connection.id}`)
            connection.emit('identify-as', 'receiver')
        })

        const peerConnection2 = new RTCPeerConnection()
        setPc(peerConnection2)

        connection.on('offer', async (offer) => {
            await peerConnection2.setRemoteDescription(offer)
            const answer = await peerConnection2.createAnswer()
            await peerConnection2.setLocalDescription(answer)
            connection.emit('answer', answer)
        })

        peerConnection2.onicecandidate = (event) => {
            connection.emit('icecandidate', event.candidate)
        }

        connection.on('icecandidate', (candidate) => {
            peerConnection2.addIceCandidate(candidate)
        })

        peerConnection2.ontrack = (event) => {
            const stream = new MediaStream([event.track])
            videoRef.current!.srcObject = stream
            videoRef.current!.play()
        }


        return () => {
            socket?.emit('disconnect')
        }
    }, [])



    return (<div><h1>Receiver</h1><video ref={videoRef} autoPlay ></video></div>)
}