import { Routes, Route } from 'react-router-dom'
import Sender from './components/Sender'
import Receiver from './components/Reciever'
import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path='/sender' element={<Sender />} />
        <Route path='/receiver' element={<Receiver />} />
      </Routes>
    </>
  )
}

export default App
