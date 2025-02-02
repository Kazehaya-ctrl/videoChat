import { useEffect } from "react"
import io from 'socket.io-client'

export default function Sender() {
    useEffect(() => {
        const socket = io('http://localhost:3000')
        socket.on('connect', () => {
            console.log('Connected to server')
        })
    }, [])
    return (
        <div>
            <h1>Sender</h1>
        </div>
    )

}
