import { useEffect, useState } from "react"
import io, { Socket } from 'socket.io-client'

export default function Sender() {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [pc , setPc] = useState<RTCPeerConnection | null> (null)

    useEffect(() => {
        const connection = io('ws://localhost:3000')
        setSocket(connection)
        
        socket?.on('connect', () => {
            console.log(`Sender connect ${socket.id}`)
            socket.emit('identify-as', 'sender')
        })

        return () => {
            socket?.emit('disconnect')
        }
    }, [])

    const handleSender = async () => {
        const peerConnection = new RTCPeerConnection()
        setPc(peerConnection)   
        
        peerConnection.onicecandidate = (event: any) => {
            console.log(event.candidate)
        }
    }

    return (<div><h1>Sender</h1><video id="video" autoPlay playsInline muted></video><button onClick={handleSender}>Send msg</button></div>)
}