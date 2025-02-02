import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sender from './components/Sender'
import Reciever from './components/Reciever'
import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path='/sender' element={<Sender />} />
        <Route path='/reciever' element={<Reciever />} />
      </Routes>
    </>
  )
}

export default App
