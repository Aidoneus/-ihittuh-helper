const renderCustomText = (syllables=document.getElementById('textToDraw').split(' '), dir=state.direction, customTarget) => {
  let currentRow = 1,
      currentColumn = 1,
      drawingCanvas;
  if (customTarget) {
    drawingCanvas = document.createElement('canvas');
    drawingCanvas.id = randomId('drawingCanvas');
    customTarget.appendChild(drawingCanvas);
  } else drawingCanvas = document.getElementById('drawingCanvas');
  const freespace = customTarget ? 1 : state.freespace,
        rows = customTarget ? 1 : state.rows,
        columns = customTarget ? 9 : state.columns,
        letterWidth = customTarget ? 32 : state.size,
        letterHeight = customTarget ? 32 : state.size,
        canvasWidth = columns * letterWidth + freespace*2,
        canvasHeight = rows * letterHeight + freespace*2;
        //ratio = fontOriginalSize / (customTarget ? 28 : state.size);
  drawingCanvas.width = canvasWidth;
  drawingCanvas.height = canvasHeight;
  let ctx = drawingCanvas.getContext('2d');
  ctx.clearRect(0,0,canvasWidth,canvasHeight);
  ctx.imageSmoothingEnabled = state.smoothing;

  const print = (syllable,x,y) => {
    let ratio = currentFont[syllable].width / (customTarget ? 32 : state.size);
    ctx.drawImage(currentFont[syllable],
      x,
      y + (currentFont[syllable].width/ratio/2) - (currentFont[syllable].height/ratio/2),
      currentFont[syllable].width/ratio,
      currentFont[syllable].height/ratio);
  };

  for (let s of syllables) {
    print(s, freespace + (currentColumn-1)*letterWidth, freespace + (currentRow-1)*letterHeight);
    currentColumn++;
    if (currentColumn > columns) {
      currentColumn = 1;
      currentRow++;
    }
    if (currentRow > rows) break;
  }

  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = state.color;
  ctx.fillRect(0,0,canvasWidth,canvasHeight);
  ctx.globalCompositeOperation = 'source-over';
};