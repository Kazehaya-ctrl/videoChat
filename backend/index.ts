import express from 'express'
import cors from 'cors'
import { Server, Socket } from 'socket.io'


const app = express()

app.use(cors())

let senderSocket: Socket | null = null
let recieverSocket: Socket | null = null

const server = app.listen(3000, () => {
    console.log('Server is running on port 3000')
})

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
})


io.on('connection', (socket) => {
    console.log(`Connection established with ${socket.id}`)

    socket.on('connection-type', (type: string) => {
        if (type === 'sender') {
            if (senderSocket) {
                senderSocket.disconnect()
            }
            senderSocket = socket
            console.log('Sender connected')
        } else if (type === 'receiver') {
            if (recieverSocket) {
                recieverSocket.disconnect()
            }
            recieverSocket = socket
            console.log('Receiver connected')
        }
    })

    socket.on('offer', (offer: RTCSessionDescriptionInit) => {
        if (recieverSocket) {
            recieverSocket.emit('offer', offer)
        }
    })

    socket.on('answer', (answer: RTCSessionDescriptionInit) => {
        if (senderSocket) {
            senderSocket.emit('answer', answer)
        }
    })

    socket.on('ice-candidate', ({ candidate, type }: { candidate: any, type: string }) => {
        if (type === 'sender') {
            if (recieverSocket) {
                recieverSocket.emit('ice-candidate', { candidate, type: 'sender' })
            }
        } else if (type === 'receiver') {
            if (senderSocket) {
                senderSocket.emit('ice-candidate', { candidate, type: 'receiver' })
            }
        }
    })

    socket.on('disconnect', () => {
        console.log(`Connection disconnected with ${socket.id}`)
        if (socket === senderSocket) {
            senderSocket = null
            if (recieverSocket) {
                recieverSocket.emit('peer-disconnected')
            }
        } else if (socket === recieverSocket) {
            recieverSocket = null
            if (senderSocket) {
                senderSocket.emit('peer-disconnected')
            }
        }
    })
})



