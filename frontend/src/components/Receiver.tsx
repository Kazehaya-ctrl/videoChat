import React, { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

export default function Receiver() {
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
                console.log("Receiver ICE candidate:", event.candidate);
                socket?.emit('ice-candidate', {
                    candidate: event.candidate,
                    type: 'receiver'
                });
            } else {
                console.log("Receiver ICE candidate gathering completed");
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

        socket?.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit, type: string }) => {
            if (data.type === 'sender') {
                try {
                    console.log("Receiver received ICE candidate:", data.candidate);
                    await pc.addIceCandidate(data.candidate);
                } catch (e) {
                    console.error('Error adding received ICE candidate', e);
                }
            }
        })

        pc.ontrack = (event) => {
            const videoStream = document.querySelector('#video') as HTMLVideoElement
            if (!videoStream.srcObject) {
                videoStream.srcObject = new MediaStream()
                videoStream.srcObject.addTrack(event.track)
                videoStream.play()
            }
        }
    }

    return (
        <div>
            <h1>Receiver</h1>
            <video id="video" autoPlay playsInline></video>
        </div>
    )
}