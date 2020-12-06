require('dotenv').config()
const http = require('http')
const express = require('express')
const cors = require('cors')
const app = express()
const Note = require('./models/note')
const { notEqual } = require('assert')


app.use(express.json())
app.use (cors())
const requestLogger = (request, response, next) => {
  console.log('Method: ', request.method)
  console.log('Path: ', request.path)
  console.log('Body: ', request.body)
  console.log('---')
  next()
}

app.use (requestLogger)


app.get ('/', (requset, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get ('/api/notes', async (request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})

app.get ('/api/notes/:id', async (request, response) => {
  const note = await Note.findById(request.body.id)
  if (note)
  {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

app.delete ('/api/notes/:id', async(request, response) => {
  await Note.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

app.post ('/api/notes', async (request, response) => {
  const body = request.body
  if (body.content === undefined) {
    return response.status(400).json({error: 'content missing'})
  }
  const note = new Note ({
    content: body.content
  })
  const returnedNote = await note.save()
  response.status(201).json(returnedNote)
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
  return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
