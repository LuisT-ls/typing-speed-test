// backend/server.js

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Conectar ao MongoDB
const mongoURI = 'mongodb://localhost:27017/typing-speed-test'
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err))

// Definir o esquema e modelo
const scoreSchema = new mongoose.Schema({
  name: String,
  wpm: Number,
  accuracy: Number,
  date: { type: Date, default: Date.now }
})

const Score = mongoose.model('Score', scoreSchema)

// Rotas
app.get('/', (req, res) => {
  res.send('API do Teste de Velocidade de Digitação')
})

// Endpoint para salvar pontuações
app.post('/scores', async (req, res) => {
  const { name, wpm, accuracy } = req.body
  try {
    const newScore = new Score({ name, wpm, accuracy })
    await newScore.save()
    res.status(201).json({ message: 'Pontuação salva com sucesso!' })
  } catch (error) {
    console.error('Erro ao salvar a pontuação:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Endpoint para obter todas as pontuações
app.get('/scores', async (req, res) => {
  try {
    const scores = await Score.find().sort({ date: -1 })
    res.json(scores)
  } catch (error) {
    console.error('Erro ao obter pontuações:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
