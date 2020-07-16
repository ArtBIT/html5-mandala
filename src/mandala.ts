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
        this.pattern.setTransform(
            this.matrix.scale(this.scale).rotate(this.rotation)
        );
    }
    render(ctx, params) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const halfwidth = width / 2;
        const halfheight = height / 2;
        const diagonal = Math.sqrt(width * width + height * height);
        const halfdiag = diagonal / 2;

        ctx.save();
        let angleIncrease = Math.PI / params.symmetries;
        ctx.translate(halfwidth, halfheight);
        ctx.rotate((params.angle / 180) * Math.PI);
        for (let s = 0; s < params.symmetries; s++) {
            ctx.rotate(angleIncrease * 2);
            this.drawSlice(
                ctx,
                halfdiag,
                params.patternScale,
                angleIncrease,
                params.offset.s * width,
                params.offset.v * height
            );
            ctx.scale(1, -1);
            this.drawSlice(
                ctx,
                halfdiag,
                params.patternScale,
                angleIncrease,
                params.offset.s * width,
                params.offset.v * height
            );
            ctx.scale(1, -1);
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
