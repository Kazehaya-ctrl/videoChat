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
            senderSocket = socket
        } else if (type === 'receiver') {
            receiverSocket = socket
        }
    })
    
    
    socket.on('disconnect', () => {
        console.log(`Disconnected ${socket.id}`)
    })

})
