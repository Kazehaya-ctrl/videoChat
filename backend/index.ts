import express from 'express'
import cors from 'cors'
import { Server, Socket } from 'socket.io'


const app = express()

app.use(cors())

let senderSocket: Socket | null = null
let receiverSocket: Socket | null = null

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

    socket.on('identify-as', (type: string) => {
        if (type === 'sender') {
            if (senderSocket) {
                senderSocket.disconnect()
            }
            senderSocket = socket
            console.log('Sender Connection established')

            socket.on('icecandidate', (candidate) => {
                receiverSocket?.emit('icecandidate', candidate)
            })

            socket.on('offer', (offer) => {
                receiverSocket?.emit('offer', offer)
            })

        } else if (type === 'receiver') {
            if (receiverSocket) {
                receiverSocket.disconnect()
            }
            receiverSocket = socket
            console.log('Receiver socket established')

            socket.on('icecandidate', (candidate) => {
                senderSocket?.emit('icecandidate', candidate)
            })

            socket.on('answer', (answer) => {
                senderSocket?.emit('answer', answer)
            })
        }
    })

    socket.on('disconnect', () => {
        if (socket === senderSocket) senderSocket = null
        if (socket === receiverSocket) receiverSocket = null
        console.log(`Disconnected ${socket.id}`)
    })
})