// @ts-nocheck
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
    if (params.symmetries == 0) {
      ctx.save();
      let xOffset = params.offset.x * width;
      let yOffset = params.offset.y * height;

      ctx.translate(halfwidth, halfheight);
      ctx.rotate((params.angle / 180) * Math.PI);
      ctx.fillStyle = this.pattern;

      ctx.scale(1, -1);
      ctx.translate(xOffset, yOffset);
      ctx.fillRect(
        -halfdiag - xOffset,
        -halfdiag - yOffset,
        diagonal,
        diagonal
      );
      ctx.restore();
    } else if (params.symmetries == 1) {
      ctx.save();
      let xOffset = params.offset.x * width;
      let yOffset = params.offset.y * height;

      ctx.translate(halfwidth, halfheight);
      ctx.rotate((params.angle / 180) * Math.PI);
      ctx.fillStyle = this.pattern;

      ctx.scale(1, -1);
      ctx.translate(xOffset, yOffset);
      ctx.fillRect(-halfdiag - xOffset, -yOffset, diagonal, halfdiag);
      ctx.translate(-xOffset, -yOffset);

      ctx.scale(1, -1);
      ctx.translate(xOffset, yOffset);
      ctx.fillRect(-halfdiag - xOffset, -yOffset, diagonal, halfdiag);

      ctx.restore();
    } else {
      let angleIncrease = Math.PI / params.symmetries;
      let baseAngle = (params.angle / 180) * Math.PI;

      for (let s = 0; s < params.symmetries; s++) {
        // Calculate this slice's angle from base state (no accumulation)
        let sliceAngle = baseAngle + (angleIncrease * 2 * s);

        // Draw normal slice
        ctx.save();
        ctx.translate(halfwidth, halfheight);
        ctx.rotate(sliceAngle + angleIncrease * 2);
        this.drawSlice(
          ctx,
          halfdiag,
          1,
          angleIncrease,
          params.offset.x * width,
          params.offset.y * height
        );
        ctx.restore();

        // Draw mirrored slice
        ctx.save();
        ctx.translate(halfwidth, halfheight);
        ctx.rotate(sliceAngle + angleIncrease * 2);
        ctx.scale(1, -1);
        this.drawSlice(
          ctx,
          halfdiag,
          1,
          angleIncrease,
          params.offset.x * width,
          params.offset.y * height
        );
        ctx.restore();
      }
    }
    ctx.restore();
  }

  drawSlice(ctx, radius, scale, sliceAngle, xOffset, yOffset) {
    ctx.save();
    xOffset = (xOffset || 0) * scale;
    yOffset = (yOffset || 0) * scale;

    ctx.translate(xOffset, yOffset);
    ctx.fillStyle = this.pattern;

    // Add overlap to prevent gaps between slices
    const overlapFactor = 0.005; // 0.5% overlap = ~10 pixels at 2048px
    const radiusWithOverlap = radius * (1 + overlapFactor);
    const angleWithOverlap = sliceAngle * (1 + overlapFactor);

    ctx.beginPath();
    ctx.moveTo(-xOffset, -yOffset); // Center point
    ctx.arc(
      -xOffset,
      -yOffset,
      radiusWithOverlap,
      -overlapFactor, // Start slightly before 0
      angleWithOverlap, // End slightly past sliceAngle
      false           // Counterclockwise
    );
    ctx.closePath();
    ctx.fill();

    // Add hairline stroke to cover any remaining anti-aliasing gaps
    ctx.strokeStyle = this.pattern;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}
export default Mandala;
