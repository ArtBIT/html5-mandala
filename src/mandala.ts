class Mandala {
  constructor(stage) {
    this.matrix = new DOMMatrix();
    this.scale = 1;
    this.rotation = 0;
  }
  setScale(scale) {
    this.scale = scale;
    this.update();
  }
  setRotation(angle) {
    this.rotation = angle;
    this.update();
  }
  setPattern(pattern) {
    this.pattern = pattern;
    this.update();
  }
  update() {
    if (!this.pattern) {
      return;
    }
    try {
      this.pattern.setTransform(
        this.matrix.scale(this.scale).rotate(this.rotation)
      );
    } catch (e) {
      // Firefox does not support DOMMatrix
      this.matrix = document
        .createElementNS("http://www.w3.org/2000/svg", "svg")
        .createSVGMatrix();
      this.pattern.setTransform(
        this.matrix.scale(this.scale).rotate(this.rotation)
      );
    }
  }
  render(ctx, params) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const halfwidth = width / 2;
    const halfheight = height / 2;
    const diagonal = Math.sqrt(width * width + height * height);
    const halfdiag = diagonal / 2;

    ctx.save();
    ctx.fillStyle = params.backgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (params.symmetries == 1) {
      ctx.save();
      let xOffset = params.offset.x * width;
      let yOffset = params.offset.y * height;

      ctx.translate(halfwidth, halfheight);
      ctx.rotate((params.angle / 180) * Math.PI);
      ctx.translate(-halfdiag, -halfdiag);
      ctx.translate(xOffset, yOffset);
      ctx.fillStyle = this.pattern;
      ctx.fillRect(-xOffset, -yOffset, diagonal, diagonal);
      //ctx.fillRect(-halfdiag, -halfdiag, diagonal, diagonal);
      ctx.restore();
    } else if (params.symmetries == 2) {
      ctx.save();
      let xOffset = params.offset.x * width;
      let yOffset = params.offset.y * height;

      ctx.translate(halfwidth, halfheight);
      ctx.rotate((params.angle / 180) * Math.PI);
      ctx.translate(xOffset, yOffset);
      ctx.fillStyle = this.pattern;
      ctx.fillRect(
        -xOffset - halfdiag,
        -yOffset - halfdiag,
        diagonal,
        halfdiag
      );
      ctx.translate(-xOffset, -yOffset);
      ctx.scale(1, -1);
      ctx.translate(xOffset, yOffset);
      ctx.fillRect(
        -xOffset - halfdiag,
        -yOffset - halfdiag,
        diagonal,
        halfdiag
      );
      ctx.restore();
    } else {
      ctx.save();
      let angleIncrease = Math.PI / params.symmetries;
      ctx.translate(halfwidth, halfheight);
      ctx.rotate((params.angle / 180) * Math.PI);
      for (let s = 0; s < params.symmetries; s++) {
        ctx.rotate(angleIncrease * 2);
        this.drawSlice(
          ctx,
          halfdiag,
          1, //params.patternScale,
          angleIncrease,
          params.offset.x * width,
          params.offset.y * height
        );
        ctx.scale(1, -1);
        this.drawSlice(
          ctx,
          halfdiag,
          1, //params.patternScale,
          angleIncrease,
          params.offset.x * width,
          params.offset.y * height
        );
        ctx.scale(1, -1);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  drawSlice(ctx, radius, scale, sliceAngle, xOffset, yOffset) {
    ctx.save();
    xOffset = (xOffset || 0) * scale;
    yOffset = (yOffset || 0) * scale;

    ctx.translate(xOffset, yOffset);
    ctx.fillStyle = this.pattern;

    ctx.beginPath();
    ctx.moveTo(-xOffset, -yOffset);
    ctx.lineTo(radius - xOffset, -yOffset);
    ctx.lineTo(radius - xOffset, Math.tan(sliceAngle) * radius - yOffset);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
export default Mandala;
