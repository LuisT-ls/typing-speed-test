import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import html2canvas from 'html2canvas'
import Result from './Result'
import VirtualKeyboard from './VirtualKeyboard'
import LevelIndicator from './LevelIndicator'
import AchievementPopup from './AchievementPopup'
import ShareButtons from './ShareButtons'
import './style/TypingTest.css'

// Constantes
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
  // Estados
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
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState('light')
  const [level, setLevel] = useState(1)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementMessage, setAchievementMessage] = useState('')
  const [wpmHistory, setWpmHistory] = useState([])
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Refs
  const inputRef = useRef(null)
  const resultRef = useRef(null)
  const correctSound = useRef(new Audio('/sounds/correct.mp3'))
  const incorrectSound = useRef(new Audio('/sounds/incorrect.mp3'))

  // Efeitos
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
        setWpmHistory(prevHistory => [...prevHistory, wpm])
      }, 1000)
    } else if (timer === 0) {
      clearInterval(interval)
      endTest()
    }
    return () => clearInterval(interval)
  }, [isActive, isPaused, timer, wpm])

  useEffect(() => {
    document.body.className = theme
  }, [theme])

  // Funções auxiliares
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
    setWpmHistory([])
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
    setWpmHistory([])
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
          if (soundEnabled) correctSound.current.play()
          return newStreak
        })
      } else {
        setErrorCount(prevCount => prevCount + 1)
        setStreak(0)
        if (soundEnabled) incorrectSound.current.play()
      }

      setUserInput(value)

      if (value === text) {
        endTest()
      }
    } else {
      setUserInput(value)
      checkWordMatch(value.trim())
    }

    const timeSpent = 60 - timer
    const currentWpm =
      timeSpent > 0 ? Math.round((wordsTyped / timeSpent) * 60) : 0
    setWpm(currentWpm)
    setFallSpeed(Math.max(1, getDifficultyFallSpeed() - currentWpm / 20))

    checkAchievements(currentWpm)
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
      if (soundEnabled) correctSound.current.play()
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
    const accuracyCalc =
      totalCharsTyped > 0
        ? ((correctChars / totalCharsTyped) * 100).toFixed(2)
        : 0

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

  const toggleSettings = () => setShowSettings(!showSettings)
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')
  const toggleSound = () => setSoundEnabled(!soundEnabled)

  const checkAchievements = currentWpm => {
    if (currentWpm >= 40 && level === 1) {
      setLevel(2)
      showAchievementPopup('Nível 2 desbloqueado! Você está ficando rápido!')
    } else if (currentWpm >= 60 && level === 2) {
      setLevel(3)
      showAchievementPopup('Nível 3 desbloqueado! Impressionante!')
    } else if (currentWpm >= 80 && level === 3) {
      setLevel(4)
      showAchievementPopup(
        'Nível 4 desbloqueado! Você é um mestre da digitação!'
      )
    }
  }

  const showAchievementPopup = message => {
    setAchievementMessage(message)
    setShowAchievement(true)
    setTimeout(() => setShowAchievement(false), 3000)
  }

  // Renderização do componente
  return (
    <div className={`typing-test ${theme}`}>
      <h1>Teste de Velocidade de Digitação</h1>
      <div className="test-area">
        {/* Controles e configurações */}
        <div className="controls">
          {/* Código dos seletores de modo e dificuldade */}
          <div className="mode-selector">
            <label>
              <i className="fas fa-keyboard"></i> Modo:
            </label>
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
            <label>
              <i className="fas fa-tachometer-alt"></i> Dificuldade:
            </label>
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
          <button onClick={toggleSettings} className="settings-btn">
            <i className="fas fa-cog"></i>
          </button>
        </div>
        
        {showSettings && (
          <div className="settings-panel">
            {/* Código das configurações de tema e som */}
            <h3>Configurações</h3>
            <div className="theme-toggle">
              <label>Tema:</label>
              <button onClick={toggleTheme}>
                {theme === 'light' ? (
                  <i className="fas fa-moon"></i>
                ) : (
                  <i className="fas fa-sun"></i>
                )}
                {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
              </button>
            </div>
            <div className="sound-toggle">
              <label>Som:</label>
              <button onClick={toggleSound}>
                {soundEnabled ? (
                  <i className="fas fa-volume-up"></i>
                ) : (
                  <i className="fas fa-volume-mute"></i>
                )}
                {soundEnabled ? 'Desativar Som' : 'Ativar Som'}
              </button>
            </div>
          </div>
        )}

        <div className="control-buttons">
          <button
            onClick={isActive ? (isPaused ? resumeTest : pauseTest) : startTest}
            className={
              isActive ? (isPaused ? 'resume-btn' : 'pause-btn') : 'start-btn'
            }
          >
            {isActive ? (
              isPaused ? (
                <i className="fas fa-play"></i>
              ) : (
                <i className="fas fa-pause"></i>
              )
            ) : (
              <i className="fas fa-play"></i>
            )}
            {isActive ? (isPaused ? 'Retomar' : 'Pausar') : 'Iniciar'}
          </button>
          <button
            onClick={resetTest}
            disabled={isActive && !isPaused}
            className="reset-btn"
          >
            <i className="fas fa-redo"></i> Zerar
          </button>
        </div>

        <div className="stats">
          <div className="timer">
            <i className="fas fa-clock"></i>
            <span>Tempo: {timer}s</span>
          </div>
          <div className="wpm">
            <i className="fas fa-tachometer-alt"></i>
            <span>WPM: {wpm}</span>
          </div>
          <div className="accuracy">
            <i className="fas fa-bullseye"></i>
            <span>Precisão: {accuracy}%</span>
          </div>
          <div className="streak">
            <i className="fas fa-fire"></i>
            <span>Sequência: {streak}</span>
          </div>
          <div className="highest-streak">
            <i className="fas fa-trophy"></i>
            <span>Maior Sequência: {highestStreak}</span>
          </div>
        </div>

        <LevelIndicator level={level} />

        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${(timer / 60) * 100}%` }}
          ></div>
        </div>

        {mode === 'frases' ? (
          <>
            <p className="text">
              {text.split('').map((char, index) => (
                <span
                  key={index}
                  className={
                    index < userInput.length
                      ? char === userInput[index]
                        ? 'correct'
                        : 'incorrect'
                      : ''
                  }
                >
                  {char}
                </span>
              ))}
            </p>
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
      </div>

      <VirtualKeyboard
        highlightedKeys={userInput.split('').slice(-1)[0] || ''}
      />

      {/* Resultados e compartilhamento */}
      {isFinished && (
        <div ref={resultRef}>
          <Result
            wpm={wpm}
            accuracy={accuracy}
            highestStreak={highestStreak}
            level={level}
            text={text}
          />
          <ShareButtons
            wpm={wpm}
            accuracy={accuracy}
            level={level}
            resultRef={resultRef}
          />
        </div>
      )}

      {/* Pop-up de conquistas */}
      {showAchievement && <AchievementPopup message={achievementMessage} />}
    </div>
  )
}

export default TypingTest
