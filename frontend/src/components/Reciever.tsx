import React, { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

const Receiver: React.FC = () => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)

    useEffect(() => {
        const socket = io('http://localhost:3000')
        setSocket(socket)
        socket.on('connect', () => {
            socket.emit('connection-type', 'receiver')
            console.log('Receiver connected')
        })

        handleOffer()

        return () => {
            socket.off('connect')
            socket.off('connection-type')
            socket.off('offer')
            socket.off('ice-candidate')
            peerConnection?.close()
        }
    }, [])

    async function handleOffer() {
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
                socket?.emit('ice-candidate', {
                    candidate: event.candidate,
                    type: 'receiver'
                })
            }
        }

        socket?.on('offer', async (offer: RTCSessionDescriptionInit) => {
            console.log('Offer received', offer)
            try {
                await pc.setRemoteDescription(offer)
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                socket?.emit('answer', answer)
            } catch (e) {
                console.error('Error handling offer:', e)
            }
        })

        socket?.on('ice-candidate', async (data: { candidate: RTCIceCandidate, type: string }) => {
            if (data.type === 'sender') {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
                } catch (e) {
                    console.error('Error adding received ice candidate', e)
                }
            }
        })

        pc.ontrack = (event) => {
            const video = document.getElementById('video') as HTMLVideoElement
            if (video && event.streams[0]) {
                video.srcObject = event.streams[0]
            }
        }
    }

    return (
        <div>
            <video id="video" autoPlay playsInline></video>
        </div>
    )
}

export default Receiver
