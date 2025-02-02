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
            senderSocket = socket
            console.log('Sender connected')
        } else if (type === 'reciever') {
            recieverSocket = socket
            console.log('Reciever connected')
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
})



