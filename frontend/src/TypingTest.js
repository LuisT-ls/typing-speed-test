import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Result from './Result'
import './TypingTest.css'

const sampleTexts = [
  'A vida é como andar de bicicleta. Para manter o equilíbrio, você deve continuar em movimento.',
  'O sucesso geralmente vem para aqueles que estão muito ocupados para estar procurando por ele.',
  'Não importa quão devagar você vá, desde que você não pare.',
  'A persistência é o caminho do êxito.',
  'O único lugar onde o sucesso vem antes do trabalho é no dicionário.'
]

const sampleWords = [
  'carro',
  'gato',
  'casa',
  'livro',
  'água',
  'futebol',
  'música',
  'computador',
  'telefone',
  'janela',
  'escola',
  'amigo',
  'trabalho',
  'família',
  'cidade',
  'sonho',
  'viagem',
  'comida',
  'estrela',
  'oceano',
  'montanha',
  'flores',
  'sol',
  'lua',
  'vento',
  'chuva',
  'árvore',
  'pássaro',
  'peixe',
  'borboleta'
]

const TypingTest = () => {
  const [mode, setMode] = useState('frases')
  const [difficulty, setDifficulty] = useState('normal')
  const [text, setText] = useState('')
  const [currentWord, setCurrentWord] = useState(null)
  const [userInput, setUserInput] = useState('')
  const [timer, setTimer] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [backspaceCount, setBackspaceCount] = useState(0)
  const [fallSpeed, setFallSpeed] = useState(5)
  const [showFallingWord, setShowFallingWord] = useState(false)
  const [wordsTyped, setWordsTyped] = useState(0)
  const [streak, setStreak] = useState(0)
  const [highestStreak, setHighestStreak] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (mode === 'frases') {
      setText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
    }
  }, [mode])

  useEffect(() => {
    let interval = null
    if (isActive && !isPaused && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1)
      }, 1000)
    } else if (timer === 0) {
      clearInterval(interval)
      endTest()
    }
    return () => clearInterval(interval)
  }, [isActive, isPaused, timer])

  const generateNextWord = () => {
    const word = {
      text: sampleWords[Math.floor(Math.random() * sampleWords.length)],
      left: `${Math.random() * 90}%`,
      duration: `${fallSpeed}s`
    }
    setCurrentWord(word)
    setShowFallingWord(true)
  }

  const startTest = () => {
    setIsActive(true)
    setIsPaused(false)
    setUserInput('')
    setIsFinished(false)
    setWpm(0)
    setAccuracy(0)
    setErrorCount(0)
    setBackspaceCount(0)
    setWordsTyped(0)
    setStreak(0)
    setHighestStreak(0)
    setTimer(60)
    setFallSpeed(getDifficultyFallSpeed())
    if (mode === 'palavras') {
      generateNextWord()
    }
    setShowFallingWord(true)
    inputRef.current.focus()
  }

  const pauseTest = () => {
    setIsPaused(true)
    setIsActive(false)
  }

  const resumeTest = () => {
    setIsPaused(false)
    setIsActive(true)
    inputRef.current.focus()
  }

  const resetTest = () => {
    setIsActive(false)
    setIsPaused(false)
    setIsFinished(false)
    setTimer(60)
    setUserInput('')
    setWpm(0)
    setAccuracy(0)
    setErrorCount(0)
    setBackspaceCount(0)
    setWordsTyped(0)
    setStreak(0)
    setHighestStreak(0)
    setShowFallingWord(false)
    if (mode === 'frases') {
      setText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
    }
  }

  const handleChange = e => {
    const value = e.target.value

    if (mode === 'frases') {
      const lastChar = value[value.length - 1]
      const currentChar = text[value.length - 1]

      if (lastChar === currentChar) {
        setStreak(prev => {
          const newStreak = prev + 1
          setHighestStreak(highest => Math.max(highest, newStreak))
          return newStreak
        })
      } else {
        setErrorCount(prevCount => prevCount + 1)
        setStreak(0)
      }

      setUserInput(value)

      if (value === text) {
        endTest()
      }
    } else {
      setUserInput(value)
      checkWordMatch(value.trim())
    }

    // Calcular WPM e ajustar a velocidade de queda
    const timeSpent = 60 - timer
    const currentWpm = Math.round((wordsTyped / timeSpent) * 60)
    setWpm(currentWpm)
    setFallSpeed(Math.max(1, getDifficultyFallSpeed() - currentWpm / 20))
  }

  const checkWordMatch = input => {
    if (input === currentWord.text) {
      setUserInput('')
      setWordsTyped(prev => prev + 1)
      setStreak(prev => {
        const newStreak = prev + 1
        setHighestStreak(highest => Math.max(highest, newStreak))
        return newStreak
      })
      generateNextWord()
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Backspace') {
      setBackspaceCount(prevCount => prevCount + 1)
    }
  }

  const handlePaste = e => {
    e.preventDefault()
    alert(
      'Colar texto não é permitido neste teste. Pratique digitando a frase para melhorar sua velocidade e precisão. Você consegue!'
    )
  }

  const endTest = () => {
    setIsActive(false)
    setIsFinished(true)
    setShowFallingWord(false)
    calculateResults()
  }

  const calculateResults = () => {
    const totalCharsTyped =
      mode === 'frases' ? userInput.length : wordsTyped * 5
    const correctChars = totalCharsTyped - errorCount

    const accuracyCalc = ((correctChars / totalCharsTyped) * 100).toFixed(2)

    setWpm((correctChars / 5).toFixed(2))
    setAccuracy(accuracyCalc)

    axios
      .post('/scores', {
        name: 'Usuário',
        wpm: (correctChars / 5).toFixed(2),
        accuracy: accuracyCalc,
        errors: errorCount,
        corrections: backspaceCount,
        highestStreak: highestStreak
      })
      .then(response => {
        console.log(response.data)
      })
      .catch(error => {
        console.error('Erro ao salvar a pontuação:', error)
      })
  }

  const getDifficultyFallSpeed = () => {
    switch (difficulty) {
      case 'fácil':
        return 7
      case 'difícil':
        return 3
      default:
        return 5
    }
  }

  return (
    <div className="typing-test">
      <h1>Teste de Velocidade de Digitação</h1>
      <div className="controls">
        <div className="mode-selector">
          <label>Modo:</label>
          <select
            onChange={e => setMode(e.target.value)}
            value={mode}
            disabled={isActive || isPaused}
          >
            <option value="frases">Frases</option>
            <option value="palavras">Palavras Aleatórias</option>
          </select>
        </div>
        <div className="difficulty-selector">
          <label>Dificuldade:</label>
          <select
            onChange={e => setDifficulty(e.target.value)}
            value={difficulty}
            disabled={isActive || isPaused}
          >
            <option value="fácil">Fácil</option>
            <option value="normal">Normal</option>
            <option value="difícil">Difícil</option>
          </select>
        </div>
      </div>
      <div className="control-buttons">
        <button
          onClick={startTest}
          disabled={isActive || isPaused}
          className="start-btn"
        >
          Iniciar Teste
        </button>
        <button
          onClick={pauseTest}
          disabled={!isActive || isPaused}
          className="pause-btn"
        >
          Pausar
        </button>
        <button
          onClick={resumeTest}
          disabled={!isPaused}
          className="resume-btn"
        >
          Retomar
        </button>
        <button
          onClick={resetTest}
          disabled={isActive && !isPaused}
          className="reset-btn"
        >
          Zerar
        </button>
      </div>
      <div className="stats">
        <div className="timer">Tempo: {timer}s</div>
        <div className="wpm">WPM: {wpm}</div>
        <div className="accuracy">Precisão: {accuracy}%</div>
        <div className="streak">Sequência: {streak}</div>
        <div className="highest-streak">Maior Sequência: {highestStreak}</div>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${(timer / 60) * 100}%` }}
        ></div>
      </div>

      {mode === 'frases' ? (
        <>
          <p className="text">{text}</p>
          <textarea
            ref={inputRef}
            disabled={!isActive || isFinished || isPaused}
            value={userInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Comece a digitar aqui..."
            className="input-area"
          ></textarea>
        </>
      ) : (
        <>
          {showFallingWord && currentWord && (
            <div
              className="falling-word"
              style={{
                left: currentWord.left,
                animationDuration: currentWord.duration,
                animationPlayState: isPaused ? 'paused' : 'running'
              }}
            >
              {currentWord.text}
            </div>
          )}
          <input
            ref={inputRef}
            disabled={!isActive || isFinished || isPaused}
            value={userInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite a palavra aqui..."
            className="word-input"
          />
        </>
      )}

      {isFinished && (
        <Result wpm={wpm} accuracy={accuracy} highestStreak={highestStreak} />
      )}
    </div>
  )
}

export default TypingTest
