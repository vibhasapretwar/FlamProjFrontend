// Canvas drawing logic
export class CanvasManager {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;
        this.painting = false;
        this.currentPath = [];
        this.history = [];
        
        // Initialize canvas size
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    getMousePos(evt) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    startPosition(e) {
        this.painting = true;
        this.currentPath = [];
        this.draw(e);
    }

    endPosition() {
        this.painting = false;
        this.ctx.beginPath();
        return this.currentPath;
    }

    draw(e) {
        if (!this.painting) return;

        const { color, thickness, opacity, penStyle, brushStyle, erasing } = this.settings.getSettings();

        this.ctx.lineWidth = thickness;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = color;
        this.ctx.globalAlpha = opacity;

        if (erasing) {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.lineWidth = thickness * 2;
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = color;
        }

        const pos = this.getMousePos(e);
        this.currentPath.push(pos);

        // Apply pen style
        switch (penStyle) {
            case 'dashed':
                this.ctx.setLineDash([10, 10]);
                break;
            case 'dotted':
                this.ctx.setLineDash([2, 10]);
                break;
            case 'solid':
            default:
                this.ctx.setLineDash([]);
                break;
        }

        // Apply brush style
        switch (brushStyle) {
            case 'highlighter':
                this.highlighterBrush(pos, thickness, color);
                break;
            case 'spray':
                this.sprayPaint(pos, thickness, color);
                break;
            case 'shiny':
                this.shinyBrush(pos, thickness, color);
                break;
            case 'pen':
            default:
                this.penBrush(pos);
                break;
        }

        this.history.push({ type: 'draw', x: pos.x, y: pos.y });
    }

    penBrush(pos) {
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
    }

    highlighterBrush(pos, thickness, color) {
        this.ctx.lineWidth = thickness * 5;
        this.ctx.strokeStyle = color;
        this.ctx.globalAlpha = 0.2;
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
    }

    sprayPaint(pos, thickness, color) {
        const density = 50;
        this.ctx.fillStyle = color;
        for (let i = 0; i < density; i++) {
            const offsetX = (Math.random() - 0.5) * thickness * 2;
            const offsetY = (Math.random() - 0.5) * thickness * 2;
            this.ctx.fillRect(pos.x + offsetX, pos.y + offsetY, 1, 1);
        }
    }

    shinyBrush(pos, thickness, color) {
        const gradient = this.ctx.createRadialGradient(
            pos.x,
            pos.y,
            0,
            pos.x,
            pos.y,
            thickness
        );
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, 'black');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, thickness / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Methods for drawing received paths from other users
    drawPen(path, lineWidth, strokeStyle, globalAlpha) {
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.globalAlpha = globalAlpha;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }
        this.ctx.stroke();
        this.ctx.beginPath();
    }

    drawHighlighter(path, lineWidth, strokeStyle) {
        this.ctx.lineWidth = lineWidth * 5;
        this.ctx.globalAlpha = 0.2;
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }
        this.ctx.stroke();
        this.ctx.beginPath();
    }

    drawSpray(path, lineWidth, strokeStyle) {
        this.ctx.fillStyle = strokeStyle;
        const density = 50;
        for (let i = 0; i < path.length; i++) {
            const pos = path[i];
            for (let j = 0; j < density; j++) {
                const offsetX = (Math.random() - 0.5) * lineWidth * 2;
                const offsetY = (Math.random() - 0.5) * lineWidth * 2;
                this.ctx.fillRect(pos.x + offsetX, pos.y + offsetY, 1, 1);
            }
        }
    }

    drawShiny(path, lineWidth, strokeStyle) {
        for (let i = 0; i < path.length; i++) {
            const pos = path[i];
            const gradient = this.ctx.createRadialGradient(
                pos.x,
                pos.y,
                0,
                pos.x,
                pos.y,
                lineWidth
            );
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(0.5, strokeStyle);
            gradient.addColorStop(1, 'black');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, lineWidth / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.history = [];
    }
}

