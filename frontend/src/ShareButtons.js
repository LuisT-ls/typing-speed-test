import React from 'react'
import html2canvas from 'html2canvas'

const ShareButtons = ({ wpm, accuracy, level, resultRef }) => {
  const shareMessage = `Acabei de atingir ${wpm} WPM com ${accuracy}% de precisão no Teste de Velocidade de Digitação! Nível ${level}. Tente superar minha pontuação!`

  const shareOnInstagram = async () => {
    if (resultRef.current) {
      try {
        const canvas = await html2canvas(resultRef.current)
        const image = canvas.toDataURL('image/png')

        const newWindow = window.open('', '_blank')
        newWindow.document.write(`
          <html>
            <head>
              <title>Compartilhar no Instagram</title>
            </head>
            <body>
              <h1>Compartilhe seus resultados no Instagram</h1>
              <p>1. Salve a imagem abaixo</p>
              <p>2. Abra o Instagram e crie uma nova história ou post</p>
              <p>3. Selecione esta imagem da sua galeria</p>
              <img src="${image}" alt="Resultados do teste de digitação" />
            </body>
          </html>
        `)
      } catch (error) {
        console.error('Erro ao gerar imagem:', error)
        alert('Ocorreu um erro ao gerar a imagem para compartilhamento.')
      }
    }
  }

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        window.location.href
      )}&quote=${encodeURIComponent(shareMessage)}`,
      '_blank'
    )
  }

  return (
    <div className="share-buttons">
      <button onClick={shareOnInstagram} className="instagram-share">
        Compartilhar no Instagram
      </button>
      <button onClick={shareOnFacebook} className="facebook-share">
        Compartilhar no Facebook
      </button>
    </div>
  )
}

export default ShareButtons
