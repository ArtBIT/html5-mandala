class Stage {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ctx = canvas.getContext("2d");
    }
    clear(color) {
        if (color) {
            this.ctx.save();
            this.ctx.fillStyle = color;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        } else {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }
    drawText(text, font = "bold 48px sans-serif") {
        this.ctx.font = font;
        const textWidth = this.ctx.measureText(text).width;
        this.ctx.fillText(
            text,
            this.width / 2 - textWidth / 2,
            this.height / 2
        );
    }
    setScale(scale) {
        this.scale = scale;
        this.resize();
    }
    setWidth(width) {
        this.width = width;
        this.resize();
    }
    setHeight(height) {
        this.height = height;
        this.resize();
    }
    resize() {
        this.canvas.width = this.width;
        this.canvas.style.width = `${this.width / this.scale}px`;
        this.canvas.height = this.height;
        this.canvas.style.height = `${this.height / this.scale}px`;
    }
}

export default Stage;
